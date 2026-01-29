import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { logError, ErrorTypes } from "@/lib/errorLogger";

type VerificationStatus = 'verifying' | 'success' | 'pending' | 'error';

interface SubscriptionInfo {
  planName: string;
  displayName: string;
  status: string;
  expiresAt: string | null;
}

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  const planName = searchParams.get('plan');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User not logged in - redirect to login
          logError({
            errorType: ErrorTypes.AUTH,
            errorMessage: 'User not authenticated for payment verification',
            component: 'CheckoutSuccess',
            action: 'verifyPayment',
            metadata: { planName, sessionId }
          });
          navigate('/login');
          return;
        }

        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, planName }
        });

        if (error) {
          console.error('Verification error:', error);
          logError({
            errorType: ErrorTypes.CHECKOUT,
            errorMessage: error.message || 'Payment verification failed',
            component: 'CheckoutSuccess',
            action: 'verifyPayment',
            metadata: { planName, sessionId }
          });
          setStatus('error');
          return;
        }

        if (data.verified) {
          setSubscription(data.subscription);
          setStatus('success');
          toast.success(`Welcome to ${data.subscription.displayName}!`);
        } else if (attempts < maxAttempts) {
          // Webhook might not have processed yet - retry
          setAttempts(prev => prev + 1);
          setTimeout(verifyPayment, 2000);
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [planName, sessionId, navigate, attempts]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Payment Confirmation | ClearlyLedger</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {status === 'verifying' && (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Processing Your Payment
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your subscription...
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Attempt {attempts + 1} of {maxAttempts}
              </div>
            </div>
          )}

          {status === 'success' && subscription && (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground">
                  Welcome to <span className="font-semibold text-primary">{subscription.displayName}</span>!
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-left">
                <h3 className="font-medium text-foreground mb-2">Subscription Details</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Plan:</dt>
                    <dd className="text-foreground">{subscription.displayName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="text-green-500 capitalize">{subscription.status}</dd>
                  </div>
                  {subscription.expiresAt && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Next billing:</dt>
                      <dd className="text-foreground">
                        {new Date(subscription.expiresAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Payment Processing
                </h1>
                <p className="text-muted-foreground">
                  Your payment is being processed. This may take a few moments.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
                <p>
                  If your subscription isn't activated within 5 minutes, please contact our support team.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
                <Button onClick={handleContactSupport} variant="ghost" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground">
                  We couldn't verify your payment. Please contact support if you were charged.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={handleContactSupport} className="w-full">
                  Contact Support
                </Button>
                <Button onClick={() => navigate('/pricing')} variant="outline" className="w-full">
                  Back to Pricing
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;