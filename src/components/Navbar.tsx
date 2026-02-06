import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Menu, X, Sun, Moon, LayoutDashboard, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UsageIndicator } from "./pricing/UsageIndicator";
import { useUsageContext } from "@/contexts/UsageContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, usage, isLoading } = useUsageContext();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav ref={ref} className="fixed top-0 left-0 right-0 z-50 glass-card-strong border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(185,84%,45%)] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              ClearlyLedger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.features')}
            </Link>
            <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.howItWorks')}
            </a>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.pricing')}
            </Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.blog')}
            </Link>
            <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.security')}
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Usage indicator for authenticated users */}
            {isAuthenticated && usage && (
              <UsageIndicator
                pagesUsed={usage.pagesUsedToday}
                pagesRemaining={usage.pagesRemaining}
                dailyLimit={usage.dailyLimit}
                isUnlimited={usage.isUnlimited}
                className="mr-2"
              />
            )}
            
            <LanguageSelector />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {isLoading ? (
              <div className="w-20 h-8 bg-muted/50 rounded animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-glass-border">
            <div className="flex flex-col gap-4">
              {/* Usage indicator for mobile */}
              {isAuthenticated && usage && (
                <UsageIndicator
                  pagesUsed={usage.pagesUsedToday}
                  pagesRemaining={usage.pagesRemaining}
                  dailyLimit={usage.dailyLimit}
                  isUnlimited={usage.isUnlimited}
                  variant="full"
                  className="pb-4 border-b border-glass-border"
                />
              )}
              
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.features')}
              </Link>
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.howItWorks')}
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.blog')}
              </Link>
               <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                 {t('nav.security')}
               </Link>
               <Link to="/test-conversion" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                 <TestTube className="w-4 h-4" />
                 Test Conversion
               </Link>
               <div className="flex flex-col gap-2 pt-4 border-t border-glass-border">
                <LanguageSelector variant="full" className="justify-start w-full" />
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="justify-start"
                >
                  {theme === "dark" ? (
                    <><Sun className="h-5 w-5 mr-2" /> {t('nav.lightMode')}</>
                  ) : (
                    <><Moon className="h-5 w-5 mr-2" /> {t('nav.darkMode')}</>
                  )}
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" className="justify-start w-full gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2">
                      <LogOut className="w-4 h-4" />
                      {t('nav.signOut')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className="justify-start w-full">
                        {t('nav.signIn')}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="hero" className="w-full">
                        {t('nav.getStarted')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
