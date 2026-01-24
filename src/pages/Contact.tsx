import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { logError, ErrorTypes } from "@/lib/errorLogger";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be less than 5000 characters"),
  sendCopy: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check for pre-filled subject from URL state
  const prefilledSubject = location.state?.subject as string | undefined;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: prefilledSubject ? `Subject: ${prefilledSubject}\n\n` : "",
      sendCopy: false,
    },
  });

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - ClearlyLedger",
    "description": "Get in touch with ClearlyLedger for support, enterprise inquiries, or feedback.",
    "url": "https://clearlyledger.com/contact",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://clearlyledger.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Contact",
          "item": "https://clearlyledger.com/contact"
        }
      ]
    }
  };

  // Scroll to form when navigating with state
  useEffect(() => {
    if (prefilledSubject) {
      const formElement = document.getElementById("contact-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [prefilledSubject]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: data.name,
          email: data.email,
          message: data.message,
          sendCopy: data.sendCopy,
          isEnterprise: prefilledSubject === "Enterprise inquiry",
        },
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error: any) {
      console.error("Contact form error:", error);
      logError({
        errorType: ErrorTypes.CONTACT,
        errorMessage: error.message || 'Failed to send contact message',
        component: 'Contact',
        action: 'sendContactEmail',
        metadata: { isEnterprise: prefilledSubject === "Enterprise inquiry" }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Message Sent - ClearlyLedger</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <main className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto text-center">
              <div className="glass-card p-8 sm:p-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                  Thank you for contacting us.
                </h1>
                <p className="text-muted-foreground mb-8">
                  We've received your message and will reply by email.
                </p>
                <Button
                  variant="glass"
                  onClick={() => navigate("/pricing")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Pricing
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us - ClearlyLedger | Support & Enterprise Inquiries</title>
        <meta name="description" content="Get in touch with ClearlyLedger for support, enterprise inquiries, or feedback. We respond within 24-48 hours." />
        <meta name="keywords" content="contact ClearlyLedger, customer support, enterprise inquiry, bank statement converter help" />
        <link rel="canonical" href="https://clearlyledger.com/contact" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/contact" />
        <meta property="og:title" content="Contact Us - ClearlyLedger" />
        <meta property="og:description" content="Get in touch with ClearlyLedger for support, enterprise inquiries, or feedback." />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - ClearlyLedger" />
        <meta name="twitter:description" content="Get in touch for support or enterprise inquiries." />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>
      
      <Navbar />
      <main className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto" id="contact-form">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Contact Enterprise
              </h1>
              <p className="text-muted-foreground">
                Share your requirements and we'll respond by email within 24–48
                hours.
              </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6 sm:p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Message <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements..."
                            className="min-h-[150px] resize-y"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendCopy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-muted-foreground cursor-pointer">
                            Send me a copy of this message
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Email-only support • No account required
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Or reach us directly at{" "}
                <a 
                  href="mailto:helppropsal@outlook.com" 
                  className="text-primary hover:underline"
                >
                  helppropsal@outlook.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;