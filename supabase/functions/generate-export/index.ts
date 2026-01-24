import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required to export data",
          requiresAuth: true,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authentication token",
          requiresAuth: true,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User ID not found in token",
          requiresAuth: true,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    // Get user's plan and check entitlements
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

    // Check PII masking permissions
    // pii_masking: 'none' = no full data access (anonymous/free)
    // pii_masking: 'optional' = can choose masked or full (starter/pro)
    // pii_masking: 'enforced' = must use masked (business/lifetime for compliance)
    if (exportType === "full" && plan.pii_masking === "none") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Full data export requires a paid plan. Upgrade to access unmasked data.",
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enforce masking for business/lifetime plans (compliance requirement)
    const actualExportType =
      plan.pii_masking === "enforced" ? "masked" : exportType;

    // Check remaining quota
    const { data: remainingPages, error: quotaError } = await supabaseAdmin.rpc(
      "get_remaining_pages",
      { p_user_id: userId }
    );

    if (quotaError) {
      console.error("Error checking quota:", quotaError);
    }

    // -1 means unlimited
    if (remainingPages !== null && remainingPages !== -1 && remainingPages <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You have reached your page limit. Please upgrade your plan for more capacity.",
          quotaExceeded: true,
          upgradeRequired: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Apply masking if needed (server-side enforcement)
    const processedTransactions =
      actualExportType === "masked"
        ? maskTransactions(transactions)
        : transactions;

    // Generate file content
    const hasAccountColumn = transactions.some((tx) => tx.account);
    const csvContent = generateCSV(processedTransactions, hasAccountColumn);

    // Generate filename
    const suffix = actualExportType === "masked" ? "_anonymized" : "_full";
    const outputFilename = `${filename.replace(/\.pdf$/i, "")}${suffix}.${format === "xlsx" ? "csv" : format}`;

    // Log export for audit trail (using service role to bypass RLS)
    const { error: logError } = await supabaseAdmin.from("export_logs").insert({
      user_id: userId,
      filename: outputFilename,
      export_type: actualExportType,
      format: format === "xlsx" ? "csv" : format, // Currently only CSV supported
      transaction_count: transactions.length,
      page_count: pageCount || null,
    });

    if (logError) {
      console.error("Failed to log export:", logError);
      // Don't fail the export, just log the error
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
            ? "Export type was adjusted to masked for compliance requirements"
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
