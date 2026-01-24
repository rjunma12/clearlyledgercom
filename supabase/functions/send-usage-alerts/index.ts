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
    // This function should only be called by cron jobs or admin systems
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Only accept standard Bearer token authentication
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Unauthorized access attempt to send-usage-alerts: missing Bearer token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== serviceRoleKey) {
      console.error('Unauthorized access attempt to send-usage-alerts: invalid token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Get users who need usage alerts
    const { data: usersToAlert, error: fetchError } = await supabaseAdmin
      .rpc('get_users_needing_usage_alert');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!usersToAlert || usersToAlert.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users need alerts', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const user of usersToAlert) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .usage-bar { background: #e2e8f0; border-radius: 8px; height: 12px; margin: 20px 0; overflow: hidden; }
              .usage-fill { background: linear-gradient(90deg, #f59e0b, #ef4444); height: 100%; border-radius: 8px; }
              .cta { display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Daily Limit Almost Reached</h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>You've used <strong>${user.percent_used}%</strong> of your daily page limit on ClearlyLedger.</p>
                
                <div class="usage-bar">
                  <div class="usage-fill" style="width: ${user.percent_used}%"></div>
                </div>
                
                <p><strong>${user.pages_used}</strong> of <strong>${user.daily_limit}</strong> pages used today.</p>
                
                <p>Need more pages? Upgrade to Pro or Business for <strong>unlimited processing</strong>.</p>
                
                <a href="https://clearlyexcel.com/#pricing" class="cta">View Upgrade Options</a>
                
                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Your limit resets at midnight UTC.</p>
              </div>
              <div class="footer">
                <p>ClearlyLedger • Bank Statement Processing Made Simple</p>
                <p><a href="https://clearlyexcel.com/unsubscribe" style="color: #64748b;">Unsubscribe from usage alerts</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: 'ClearlyLedger <alerts@clearlyexcel.com>',
          to: [user.email],
          subject: `⚠️ You've used ${user.percent_used}% of your daily limit`,
          html: emailHtml,
        });

        // Update last_usage_alert_at
        await supabaseAdmin
          .from('email_preferences')
          .update({ last_usage_alert_at: new Date().toISOString() })
          .eq('user_id', user.user_id);

        sentCount++;
      } catch (emailError: any) {
        console.error(`Failed to send to ${user.email}:`, emailError);
        errors.push(`${user.email}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: sentCount,
        total: usersToAlert.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-usage-alerts:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
