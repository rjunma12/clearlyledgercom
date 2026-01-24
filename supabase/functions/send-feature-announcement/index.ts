import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require service role authentication via standard Bearer token only
    // This function should only be called by admin systems, not public users
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Only accept standard Bearer token authentication
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Unauthorized access attempt to send-feature-announcement: missing Bearer token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== serviceRoleKey) {
      console.error('Unauthorized access attempt to send-feature-announcement: invalid token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { announcementId } = await req.json();

    if (!announcementId) {
      return new Response(
        JSON.stringify({ error: 'announcementId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate announcementId is a valid UUID to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(announcementId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid announcement ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the announcement
    const { data: announcement, error: announcementError } = await supabaseAdmin
      .from('feature_announcements')
      .select('*')
      .eq('id', announcementId)
      .maybeSingle();

    if (announcementError || !announcement) {
      return new Response(
        JSON.stringify({ error: 'Announcement not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent sending the same announcement twice
    if (announcement.sent_at) {
      return new Response(
        JSON.stringify({ error: 'Announcement has already been sent', sent_at: announcement.sent_at }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lifetime members
    const { data: members, error: membersError } = await supabaseAdmin
      .rpc('get_lifetime_members_for_announcement');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No lifetime members to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Escape HTML in announcement content to prevent XSS in emails
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const safeTitle = escapeHtml(announcement.title);
    const safeContent = escapeHtml(announcement.content);

    for (const member of members) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #eab308); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .feature-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .cta { display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <span class="badge">🚀 Lifetime Member Exclusive</span>
                <h1>New Feature Announcement</h1>
              </div>
              <div class="content">
                <p>Hi Lifetime Member,</p>
                <p>As one of our valued lifetime supporters, you get <strong>early access</strong> to our latest features!</p>
                
                <div class="feature-box">
                  <h2 style="margin-top: 0; color: #1a1a2e;">${safeTitle}</h2>
                  <p style="color: #64748b; margin-bottom: 0;">${safeContent}</p>
                </div>
                
                <p>Thank you for being part of our early supporter community. Your lifetime membership ensures you'll always have access to the latest and greatest features.</p>
                
                <a href="https://clearlyexcel.com/dashboard" class="cta">Try It Now</a>
              </div>
              <div class="footer">
                <p>ClearlyLedger • Bank Statement Processing Made Simple</p>
                <p><a href="https://clearlyexcel.com/unsubscribe" style="color: #64748b;">Unsubscribe from announcements</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: 'ClearlyLedger <announcements@clearlyexcel.com>',
          to: [member.email],
          subject: `🚀 New Feature: ${safeTitle}`,
          html: emailHtml,
        });

        sentCount++;
      } catch (emailError: any) {
        console.error(`Failed to send to ${member.email}:`, emailError);
        errors.push(`${member.email}: ${emailError.message}`);
      }
    }

    // Mark announcement as sent
    await supabaseAdmin
      .from('feature_announcements')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', announcementId);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        total: members.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-feature-announcement:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
