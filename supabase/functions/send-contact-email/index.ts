import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
  sendCopy: boolean;
  isEnterprise: boolean;
}

// Escape HTML special characters to prevent XSS/HTML injection
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validate and sanitize input
function validateInput(name: string, email: string, message: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }
  if (message.length > 5000) {
    return { valid: false, error: 'Message must be less than 5000 characters' };
  }
  return { valid: true };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, sendCopy, isEnterprise }: ContactEmailRequest = await req.json();

    // Validate inputs
    const validation = validateInput(name, email, message);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all user inputs
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim().toLowerCase());
    const safeMessage = escapeHtml(message.trim());

    const subjectTag = isEnterprise ? "[Enterprise Inquiry]" : "[Contact Form]";
    const timestamp = new Date().toISOString();

    // Send email to support (using sanitized values)
    const supportEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["helppropsal@outlook.com"],
        subject: `${subjectTag} Message from ${safeName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${isEnterprise ? '🏢 Enterprise Inquiry' : '📬 New Contact Message'}</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Contact Details</h2>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #0d9488;">${safeEmail}</a></p>
                <p style="margin: 8px 0;"><strong>Received:</strong> ${timestamp}</p>
                ${isEnterprise ? '<p style="margin: 8px 0;"><strong>Type:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Enterprise</span></p>' : ''}
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Message</h2>
                <div style="white-space: pre-wrap; color: #475569;">${safeMessage}</div>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${safeEmail}?subject=Re: Your inquiry" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Reply to ${safeName}</a>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!supportEmailResponse.ok) {
      // Log error server-side only, don't expose details to client
      console.error("Failed to send support email");
      throw new Error("Failed to send email");
    }

    console.log("Support email sent successfully");

    // Send copy to user if requested (using sanitized values)
    if (sendCopy) {
      const userCopyResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "PDF Statement Converter <onboarding@resend.dev>",
          to: [email], // Use original email for delivery, but escaped in HTML
          subject: "Copy of your message - PDF Statement Converter",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">📋 Copy of Your Message</h1>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #475569; margin-bottom: 20px;">Hi ${safeName},</p>
                
                <p style="color: #475569; margin-bottom: 20px;">
                  Thank you for contacting us. Here's a copy of your message for your records:
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                  <div style="white-space: pre-wrap; color: #475569;">${safeMessage}</div>
                </div>
                
                <p style="color: #475569; margin-bottom: 20px;">
                  We'll get back to you within 24–48 hours.
                </p>
                
                <p style="color: #64748b; font-size: 14px;">
                  Best regards,<br>
                  The PDF Statement Converter Team
                </p>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (userCopyResponse.ok) {
        console.log("User copy email sent successfully");
      } else {
        console.error("Failed to send user copy email");
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    // Log error server-side, return generic message to client
    console.error("Error in send-contact-email function");
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
