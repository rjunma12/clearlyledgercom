import { User } from "lucide-react";

interface AuthorSectionProps {
  name?: string;
  role?: string;
  bio?: string;
}

const AuthorSection = ({
  name = "ClearlyLedger Team",
  role = "Financial Data Experts",
  bio = "Our team specializes in bank statement processing, financial data automation, and privacy-first document conversion. We help accountants, bookkeepers, and finance professionals save hours on manual data entry.",
}: AuthorSectionProps) => {
  return (
    <div className="border-t border-border pt-8 mt-12">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Written by
          </p>
          <h4 className="font-semibold text-foreground">{name}</h4>
          <p className="text-sm text-primary mb-2">{role}</p>
          <p className="text-sm text-muted-foreground">{bio}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthorSection;
