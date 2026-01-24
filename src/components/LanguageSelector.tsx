import { forwardRef, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supportedLanguages, type SupportedLanguage, updateDocumentDirection, loadLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  className?: string;
  variant?: "icon" | "full";
}

export const LanguageSelector = forwardRef<HTMLDivElement, LanguageSelectorProps>(({ className, variant = "icon" }, ref) => {
  const { i18n } = useTranslation();
  
  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  // Handle RTL direction changes via React effect
  useEffect(() => {
    updateDocumentDirection(i18n.language);
    
    const handleLanguageChange = (lng: string) => {
      updateDocumentDirection(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = useCallback(async (langCode: SupportedLanguage) => {
    // Load translations before switching language
    await loadLanguage(langCode);
    i18n.changeLanguage(langCode);
  }, [i18n]);

  return (
    <div ref={ref}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={cn("rounded-full", className)}
          aria-label="Select language"
        >
          {variant === "icon" ? (
            <Globe className="h-5 w-5" />
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-popover border border-border shadow-lg z-50"
      >
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              i18n.language === language.code && "bg-accent"
            )}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="flex-1">{language.nativeName}</span>
            {i18n.language === language.code && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;
