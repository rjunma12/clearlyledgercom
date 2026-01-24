import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionData {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  account?: string;
}

interface ExportRequest {
  transactions: TransactionData[];
  exportType: "masked" | "full";
  format: "csv" | "xlsx";
  filename: string;
  pageCount?: number;
}

// PII masking patterns (server-side implementation)
const NAME_PATTERN = /\b(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const ACCOUNT_PATTERN = /\b(?:ACC|ACCT|A\/C|Account)[\s#:]*\d{4,}/gi;
const CARD_PATTERN = /(?:card\s+(?:ending\s+)?|ending\s+)(\d{4})/gi;

// State for consistent name anonymization
const nameMap = new Map<string, string>();
let nameCounter = 0;

function resetMaskingState() {
  nameMap.clear();
  nameCounter = 0;
}

function getAnonymizedName(originalName: string): string {
  const normalizedName = originalName.toLowerCase().trim();
  if (!nameMap.has(normalizedName)) {
    nameCounter++;
    nameMap.set(normalizedName, `Person_${String(nameCounter).padStart(3, "0")}`);
  }
  return nameMap.get(normalizedName)!;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  return `***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***-***-${digits.slice(-4)}`;
}

function maskAccountNumber(account: string): string {
  const digits = account.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

function maskPIIInText(text: string): string {
  if (!text) return text;

  let masked = text;

  // Mask emails
  masked = masked.replace(EMAIL_PATTERN, (match) => maskEmail(match));

  // Mask phone numbers
  masked = masked.replace(PHONE_PATTERN, (match) => maskPhone(match));

  // Mask account numbers
  masked = masked.replace(ACCOUNT_PATTERN, () => "ACC ****XXXX");

  // Mask card endings
  masked = masked.replace(CARD_PATTERN, "CARD ENDING XXXX");

  // Mask names (last, as it's the most aggressive)
  masked = masked.replace(NAME_PATTERN, (match) => getAnonymizedName(match));

  return masked;
}

function maskTransactions(transactions: TransactionData[]): TransactionData[] {
  resetMaskingState();
  return transactions.map((tx) => ({
    ...tx,
    description: maskPIIInText(tx.description),
    account: tx.account ? maskAccountNumber(tx.account) : undefined,
  }));
}

function generateCSV(transactions: TransactionData[], includeAccount: boolean): string {
  const headers = includeAccount
    ? ["Date", "Description", "Debit", "Credit", "Balance", "Account"]
    : ["Date", "Description", "Debit", "Credit", "Balance"];

  const rows = transactions.map((tx) => {
    const baseRow = [
      tx.date,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.debit || "",
      tx.credit || "",
      tx.balance,
    ];
    if (includeAccount) {
      baseRow.push(tx.account || "");
    }
    return baseRow.join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// Generate fingerprint from IP address for anonymous user tracking
async function generateFingerprint(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header and client IP
    const authHeader = req.headers.get("Authorization");
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    let userId: string | null = null;
    let isAuthenticated = false;
    let fingerprint: string | null = null;

    // Try to authenticate user
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

      if (!userError && user) {
        userId = user.id;
        isAuthenticated = true;
      }
    }

    // For anonymous users, generate fingerprint from IP
    if (!isAuthenticated) {
      fingerprint = await generateFingerprint(clientIP);
    }

    // Parse request body
    const body: ExportRequest = await req.json();
    const { transactions, exportType, format, filename, pageCount } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid transaction data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["masked", "full"].includes(exportType)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid export type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["csv", "xlsx"].includes(format)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's plan (or anonymous plan)
    const { data: planData, error: planError } = await supabaseAdmin.rpc("get_user_plan", {
      p_user_id: userId,
    });

    if (planError) {
      console.error("Error fetching user plan:", planError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify user plan" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const plan = planData?.[0];
    if (!plan) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No active plan found",
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ENFORCEMENT: Check format restrictions
    // Anonymous and free users can only export xlsx (Excel)
    const allowedFormats: string[] = plan.allowed_formats || ['csv', 'xlsx'];
    if (!allowedFormats.includes(format)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `${format.toUpperCase()} export requires a paid plan. Please upgrade to access CSV exports.`,
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ENFORCEMENT: Force masked export for anonymous and free users (pii_masking = 'none')
    // pii_masking: 'none' = no full data access (anonymous/free) - FORCE masked
    // pii_masking: 'optional' = can choose masked or full (starter/pro)
    // pii_masking: 'enforced' = must use masked (business/lifetime for compliance)
    let actualExportType = exportType;
    
    if (plan.pii_masking === "none") {
      // Force masked for anonymous/free - ignore any frontend request for full
      actualExportType = "masked";
    } else if (plan.pii_masking === "enforced") {
      // Force masked for business/lifetime compliance
      actualExportType = "masked";
    }
    // Only 'optional' allows the user to choose

    // Block full data export request from free tiers with explicit error
    if (exportType === "full" && plan.pii_masking === "none") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Full data export requires a paid plan. Upgrade to Starter or higher to access unmasked data.",
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check remaining quota
    const { data: remainingPages, error: quotaError } = await supabaseAdmin.rpc(
      "get_remaining_pages",
      { 
        p_user_id: userId,
        p_session_fingerprint: fingerprint 
      }
    );

    if (quotaError) {
      console.error("Error checking quota:", quotaError);
    }

    // -1 means unlimited
    if (remainingPages !== null && remainingPages !== -1 && remainingPages <= 0) {
      const resetMessage = plan.daily_limit 
        ? "Your daily limit resets in 24 hours."
        : "You have reached your monthly limit.";
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `You have reached your page limit. ${resetMessage} Please upgrade your plan for more capacity.`,
          quotaExceeded: true,
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Apply masking if needed (server-side enforcement - ALWAYS for none/enforced)
    const processedTransactions =
      actualExportType === "masked"
        ? maskTransactions(transactions)
        : transactions;

    // Generate file content (currently only CSV supported, xlsx comes as CSV for now)
    const hasAccountColumn = transactions.some((tx) => tx.account);
    const csvContent = generateCSV(processedTransactions, hasAccountColumn);

    // Generate filename
    const suffix = actualExportType === "masked" ? "_anonymized" : "_full";
    // Always output as CSV for now (xlsx support coming)
    const outputFilename = `${filename.replace(/\.pdf$/i, "")}${suffix}.csv`;

    // Log export for audit trail (using service role to bypass RLS)
    // For anonymous users, store fingerprint instead of user_id
    if (isAuthenticated && userId) {
      const { error: logError } = await supabaseAdmin.from("export_logs").insert({
        user_id: userId,
        filename: outputFilename,
        export_type: actualExportType,
        format: "csv", // Currently only CSV supported
        transaction_count: transactions.length,
        page_count: pageCount || null,
      });

      if (logError) {
        console.error("Failed to log export:", logError);
        // Don't fail the export, just log the error
      }
    }

    // Return the file as base64 (for smaller files)
    const base64Content = btoa(unescape(encodeURIComponent(csvContent)));

    return new Response(
      JSON.stringify({
        success: true,
        filename: outputFilename,
        content: base64Content,
        contentType: "text/csv",
        transactionCount: processedTransactions.length,
        exportType: actualExportType,
        message:
          actualExportType !== exportType
            ? plan.pii_masking === "enforced"
              ? "Export automatically anonymized for compliance requirements"
              : "Export type was adjusted to masked for your plan"
            : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
