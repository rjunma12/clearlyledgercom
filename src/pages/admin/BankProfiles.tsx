import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Database,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Pencil,
  Ban,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface Stats {
  totalProfiles: number;
  totalCountries: number;
  countryCodes: string[];
  mostUsedProfiles: { bank_name: string; usage_count: number; success_rate: number | null }[];
}

interface SearchProfile {
  id: string;
  bank_code: string;
  bank_name: string;
  display_name: string;
  country_code: string;
  currency_code: string | null;
  usage_count: number;
  success_rate: number | null;
  confidence_threshold: number;
}

interface Contribution {
  id: string;
  bank_name: string;
  country_code: string;
  submitted_by: string;
  contact_email: string | null;
  status: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// =============================================================================
// COMPONENT
// =============================================================================

export default function BankProfilesAdmin() {
  const { toast } = useToast();

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Contributions
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contribLoading, setContribLoading] = useState(true);

  // Profiles
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [profilesTotal, setProfilesTotal] = useState(0);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================================
  // FETCH STATS
  // =========================================================================

  useEffect(() => {
    fetch(`${API_BASE}/api/bank-profiles/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => toast({ title: "Failed to load stats", variant: "destructive" }))
      .finally(() => setStatsLoading(false));
  }, []);

  // =========================================================================
  // FETCH CONTRIBUTIONS
  // =========================================================================

  const loadContributions = useCallback(async () => {
    setContribLoading(true);
    const { data, error } = await supabase
      .from("bank_profile_contributions")
      .select("id, bank_name, country_code, submitted_by, contact_email, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load contributions", variant: "destructive" });
    } else {
      setContributions(data ?? []);
    }
    setContribLoading(false);
  }, []);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  // =========================================================================
  // FETCH PROFILES (debounced search)
  // =========================================================================

  const loadProfiles = useCallback(async (query: string) => {
    setProfilesLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (query) params.set("query", query);

    try {
      const res = await fetch(`${API_BASE}/api/bank-profiles/search?${params}`);
      const data = await res.json();
      setProfiles(data.profiles ?? []);
      setProfilesTotal(data.total ?? 0);
    } catch {
      toast({ title: "Failed to search profiles", variant: "destructive" });
    }
    setProfilesLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadProfiles(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery, loadProfiles]);

  // =========================================================================
  // ACTIONS
  // =========================================================================

  const handleContributionAction = async (id: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("bank_profile_contributions")
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: `Failed to ${action} contribution`, variant: "destructive" });
    } else {
      toast({ title: `Contribution ${action}` });
      loadContributions();
    }
  };

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  const StatCard = ({
    label,
    value,
    icon: Icon,
    loading,
  }: {
    label: string;
    value: string | number;
    icon: any;
    loading: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const pendingCount = contributions.length;

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      <h1 className="text-3xl font-bold">Bank Profiles Admin</h1>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Profiles" value={stats?.totalProfiles ?? 0} icon={Database} loading={statsLoading} />
        <StatCard label="Pending Contributions" value={pendingCount} icon={Clock} loading={contribLoading} />
        <StatCard label="Countries Covered" value={stats?.totalCountries ?? 0} icon={Globe} loading={statsLoading} />
      </div>

      {/* Pending Contributions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Contributions</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contribLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : contributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No pending contributions
                  </TableCell>
                </TableRow>
              ) : (
                contributions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.bank_name}</TableCell>
                    <TableCell><Badge variant="outline">{c.country_code}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.contact_email ?? c.submitted_by.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="default" onClick={() => handleContributionAction(c.id, "approved")}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleContributionAction(c.id, "rejected")}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* All Profiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">All Profiles ({profilesTotal})</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search banks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Code</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="text-right">Success %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profilesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.bank_code}</TableCell>
                    <TableCell className="font-medium">{p.display_name}</TableCell>
                    <TableCell><Badge variant="outline">{p.country_code}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{p.usage_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.success_rate != null ? `${(p.success_rate * 100).toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline">
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Ban className="h-3 w-3 mr-1" /> Disable
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
