import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { pages, sessionFingerprint } = await req.json();

    if (!pages || pages < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid pages count' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is authenticated
    const { data: { user } } = await supabaseAnon.auth.getUser();
    const userId = user?.id ?? null;

    if (!userId && !sessionFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Session fingerprint required for anonymous users' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's plan and check limits
    const { data: planData, error: planError } = await supabaseAdmin
      .rpc('get_user_plan', { p_user_id: userId });

    if (planError) {
      console.error('Error fetching plan:', planError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dailyLimit = planData?.[0]?.daily_limit;

    // Get remaining pages
    const { data: remaining, error: remainingError } = await supabaseAdmin
      .rpc('get_remaining_pages', {
        p_user_id: userId,
        p_session_fingerprint: userId ? null : sessionFingerprint
      });

    if (remainingError) {
      console.error('Error fetching remaining:', remainingError);
    }

    // Check if user has enough pages (unlimited = -1)
    if (remaining !== -1 && remaining < pages) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit exceeded',
          remaining,
          required: pages,
          planName: planData?.[0]?.plan_name
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert usage record
    const today = new Date().toISOString().split('T')[0];

    if (userId) {
      // For authenticated users
      const { data: existingUsage } = await supabaseAdmin
        .from('usage_tracking')
        .select('id, pages_processed')
        .eq('user_id', userId)
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
            user_id: userId,
            usage_date: today,
            pages_processed: pages
          });
      }
    } else {
      // For anonymous users
      const { data: existingUsage } = await supabaseAdmin
        .from('usage_tracking')
        .select('id, pages_processed')
        .eq('session_fingerprint', sessionFingerprint)
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
            session_fingerprint: sessionFingerprint,
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
        isUnlimited: remaining === -1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-usage:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
