import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Megaphone, Mail, Loader2 } from "lucide-react";
import { useEmailPreferences } from "@/hooks/use-email-preferences";
import { toast } from "sonner";

export function EmailPreferencesCard() {
  const { preferences, isLoading, updatePreferences } = useEmailPreferences();

  const handleToggle = async (key: 'usageAlerts' | 'featureAnnouncements' | 'marketing', value: boolean) => {
    const success = await updatePreferences({ [key]: value });
    if (success) {
      toast.success('Email preferences updated');
    } else {
      toast.error('Failed to update preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary" />
        Email Notifications
      </h3>

      <div className="space-y-4">
        {/* Usage Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="usage-alerts" className="text-sm font-medium text-foreground">
                Usage Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when you reach 80% of your daily limit
              </p>
            </div>
          </div>
          <Switch
            id="usage-alerts"
            checked={preferences.usageAlerts}
            onCheckedChange={(checked) => handleToggle('usageAlerts', checked)}
          />
        </div>

        {/* Feature Announcements */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="feature-announcements" className="text-sm font-medium text-foreground">
                Feature Announcements
              </Label>
              <p className="text-xs text-muted-foreground">
                Early access to new features (lifetime members only)
              </p>
            </div>
          </div>
          <Switch
            id="feature-announcements"
            checked={preferences.featureAnnouncements}
            onCheckedChange={(checked) => handleToggle('featureAnnouncements', checked)}
          />
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="marketing" className="text-sm font-medium text-foreground">
                Product Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Tips, tutorials, and product news
              </p>
            </div>
          </div>
          <Switch
            id="marketing"
            checked={preferences.marketing}
            onCheckedChange={(checked) => handleToggle('marketing', checked)}
          />
        </div>
      </div>
    </div>
  );
}
