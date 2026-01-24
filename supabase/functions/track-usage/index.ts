import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hash IP address for privacy-compliant rate limiting
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

interface TrackUsageRequest {
  pages: number;
  dryRun?: boolean; // If true, only check quota without decrementing
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create service role client for unrestricted access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client to check auth
    const authHeader = req.headers.get('Authorization');
    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    const body: TrackUsageRequest = await req.json();
    const { pages, dryRun = false } = body;

    if (!pages || pages < 1 || pages > 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid pages count' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is authenticated
    const { data: { user } } = await supabaseAnon.auth.getUser();
    const userId = user?.id ?? null;

    // For anonymous users, generate server-side fingerprint from IP
    let serverFingerprint: string | null = null;
    
    if (!userId) {
      // Get client IP from various headers (Cloudflare, X-Forwarded-For, etc.)
      const clientIP = req.headers.get('cf-connecting-ip') 
        || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown';
      
      // Hash IP for privacy (don't store raw IPs)
      serverFingerprint = await hashIP(clientIP);
    }

    // Get user's plan and check limits
    const { data: planData, error: planError } = await supabaseAdmin
      .rpc('get_user_plan', { p_user_id: userId });

    if (planError) {
      console.error('Error fetching plan');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dailyLimit = planData?.[0]?.daily_limit;
    const planName = planData?.[0]?.plan_name;

    // Get remaining pages
    const { data: remaining, error: remainingError } = await supabaseAdmin
      .rpc('get_remaining_pages', {
        p_user_id: userId,
        p_session_fingerprint: userId ? null : serverFingerprint
      });

    if (remainingError) {
      console.error('Error fetching remaining');
    }

    // Check if user has enough pages (unlimited = -1)
    if (remaining !== -1 && remaining < pages) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Insufficient quota. You have ${remaining} page(s) remaining but need ${pages}.`,
          remaining,
          required: pages,
          planName,
          quotaExceeded: true,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If dryRun, just return success without decrementing
    if (dryRun) {
      return new Response(
        JSON.stringify({ 
          success: true,
          dryRun: true,
          remaining,
          isUnlimited: remaining === -1,
          planName,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert usage record
    const today = new Date().toISOString().split('T')[0];

    if (userId) {
      // For authenticated users - use anon client with RLS
      const { data: existingUsage } = await supabaseAnon
        .from('usage_tracking')
        .select('id, pages_processed')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();

      if (existingUsage) {
        await supabaseAnon
          .from('usage_tracking')
          .update({ pages_processed: existingUsage.pages_processed + pages })
          .eq('id', existingUsage.id);
      } else {
        await supabaseAnon
          .from('usage_tracking')
          .insert({
            user_id: userId,
            usage_date: today,
            pages_processed: pages
          });
      }
    } else {
      // For anonymous users - use service role (required to bypass RLS)
      const { data: existingUsage } = await supabaseAdmin
        .from('usage_tracking')
        .select('id, pages_processed')
        .eq('session_fingerprint', serverFingerprint)
        .eq('usage_date', today)
        .single();

      if (existingUsage) {
        await supabaseAdmin
          .from('usage_tracking')
          .update({ pages_processed: existingUsage.pages_processed + pages })
          .eq('id', existingUsage.id);
      } else {
        await supabaseAdmin
          .from('usage_tracking')
          .insert({
            session_fingerprint: serverFingerprint,
            usage_date: today,
            pages_processed: pages
          });
      }
    }

    // Calculate new remaining
    const newRemaining = remaining === -1 ? -1 : remaining - pages;

    return new Response(
      JSON.stringify({ 
        success: true,
        pagesProcessed: pages,
        remaining: newRemaining,
        isUnlimited: remaining === -1,
        planName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-usage');
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});