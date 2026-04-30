import { lazy, Suspense, useEffect, useState } from "react";
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { registerServiceWorker } from "@/lib/serviceWorker";
import { ScrollToTop } from "@/components/ScrollToTop";
import { UsageProvider } from "@/contexts/UsageContext";

// Eager load the main landing page for fast initial render
import Index from "./pages/Index";

// Lazy load all other routes for code splitting
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const DataProcessing = lazy(() => import("./pages/DataProcessing"));
const Security = lazy(() => import("./pages/Security"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost1 = lazy(() => import("./pages/blog/BlogPost1"));
const BlogPost2 = lazy(() => import("./pages/blog/BlogPost2"));
const BlogPost3 = lazy(() => import("./pages/blog/BlogPost3"));
const BlogPost4 = lazy(() => import("./pages/blog/BlogPost4"));
const BlogPostSouthAfrica = lazy(() => import("./pages/blog/BlogPostSouthAfrica"));
const BlogPostMalaysia = lazy(() => import("./pages/blog/BlogPostMalaysia"));
const BlogPostUK = lazy(() => import("./pages/blog/BlogPostUK"));
const BlogPostJapan = lazy(() => import("./pages/blog/BlogPostJapan"));
const BlogPostWhyBanksDontProvideCSV = lazy(() => import("./pages/blog/BlogPostWhyBanksDontProvideCSV"));
const BlogPostAustralia = lazy(() => import("./pages/blog/BlogPostAustralia"));
const BlogPostRuleBasedVsAI = lazy(() => import("./pages/blog/BlogPostRuleBasedVsAI"));
const BlogPostComparison = lazy(() => import("./pages/blog/BlogPostComparison"));
const BlogPostConvertPdfGuide = lazy(() => import("./pages/blog/BlogPostConvertPdfGuide"));
const BlogPostForAccountants = lazy(() => import("./pages/blog/BlogPostForAccountants"));
const BlogPostCsvFormat = lazy(() => import("./pages/blog/BlogPostCsvFormat"));
const BlogPostAnyBankAnyCountry = lazy(() => import("./pages/blog/BlogPostAnyBankAnyCountry"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const UpgradeSuccess = lazy(() => import("./pages/UpgradeSuccess"));
const BankProfilesAdmin = lazy(() => import("./pages/admin/BankProfiles"));
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds - prevents refetching on every mount
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
      refetchOnMount: false, // Don't refetch when components remount
    },
  },
});

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  const [toastsReady, setToastsReady] = useState(false);

  // Register service worker for offline PDF processing
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker().then((status) => {
        if (status.registered) {
          console.log('Offline processing ready');
        }
      });
    }
  }, []);

  // Defer toaster portals until after first paint to avoid forced reflows
  // during the initial commit phase.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = schedule(() => setToastsReady(true));
    return () => {
      if (typeof id === 'number') clearTimeout(id);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UsageProvider>
          <TooltipProvider>
            {toastsReady && (
              <Suspense fallback={null}>
                <Toaster />
                <Sonner />
              </Suspense>
            )}
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <PaymentTestModeBanner />
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                   <Route path="/" element={<Index />} />
                   <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/data-processing" element={<DataProcessing />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/convert-bank-statements-to-excel" element={<BlogPost1 />} />
                  <Route path="/blog/indian-bank-statement-converter" element={<BlogPost2 />} />
                  <Route path="/blog/privacy-secure-bank-statement-conversion" element={<BlogPost3 />} />
                  <Route path="/blog/accurate-bank-statement-conversion-workflows" element={<BlogPost4 />} />
                  <Route path="/blog/south-africa-bank-statement-converter" element={<BlogPostSouthAfrica />} />
                  <Route path="/blog/malaysia-bank-statement-converter" element={<BlogPostMalaysia />} />
                  <Route path="/blog/uk-bank-statement-converter" element={<BlogPostUK />} />
                  <Route path="/blog/japan-bank-statement-converter" element={<BlogPostJapan />} />
                  <Route path="/blog/why-banks-dont-provide-csv-excel-statements" element={<BlogPostWhyBanksDontProvideCSV />} />
                  <Route path="/blog/australia-bank-statement-converter" element={<BlogPostAustralia />} />
                  <Route path="/blog/rule-based-vs-ai-bank-statement-conversion" element={<BlogPostRuleBasedVsAI />} />
                  <Route path="/blog/clearlyledger-vs-bankstatementconverter-comparison" element={<BlogPostComparison />} />
                  <Route path="/blog/convert-pdf-bank-statement-to-excel-2026-guide" element={<BlogPostConvertPdfGuide />} />
                  <Route path="/blog/bank-statement-converter-for-accountants" element={<BlogPostForAccountants />} />
                  <Route path="/blog/bank-statement-to-csv-format-standards" element={<BlogPostCsvFormat />} />
                  <Route path="/blog/convert-bank-statement-pdf-to-excel-any-bank" element={<BlogPostAnyBankAnyCountry />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/upgrade/success" element={<UpgradeSuccess />} />
                  <Route path="/admin/bank-profiles" element={<BankProfilesAdmin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </UsageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
