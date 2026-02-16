"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Plus,
  Upload,
  FileText,
  DollarSign,
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { generateDemandLetterPdf } from "@/lib/pdf";
import type { Claim, AnalysisResults, DashboardView } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusConfig: Record<
  Claim["status"],
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  analyzing: {
    label: "Analyzing",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  unpaid: {
    label: "Report Ready",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/30",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  paid: {
    label: "Unlocked",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const classificationColors: Record<string, string> = {
  ILLEGAL: "bg-red-500/20 text-red-400 border-red-500/30",
  LEGAL: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  DISPUTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

// ---------------------------------------------------------------------------
// Reusable glass card wrapper
// ---------------------------------------------------------------------------

function GlassCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: Claim["status"] }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.color
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// File drop zone
// ---------------------------------------------------------------------------

function FileDropZone({
  label,
  accept,
  file,
  onFile,
}: {
  label: string;
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFile(selected);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
          dragOver
            ? "border-brand-400 bg-brand-400/10"
            : "border-white/20 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-brand-400" />
            <span className="text-sm text-slate-200 truncate max-w-[200px]">
              {file.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400 text-center">
              Drag &amp; drop or click to upload
            </p>
            <p className="text-xs text-slate-600">PDF, TXT, PNG, JPG</p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (typeof window !== "undefined" && !supabaseRef.current) {
    supabaseRef.current = createClient();
  }
  const supabase = supabaseRef.current!;

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Views
  const [view, setView] = useState<DashboardView>("list");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(true);

  // New claim form
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [deductionFile, setDeductionFile] = useState<File | null>(null);
  const [deductionText, setDeductionText] = useState("");
  const [submitStep, setSubmitStep] = useState<
    "upload" | "processing" | "complete"
  >("upload");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Detail view
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pollingUnlock, setPollingUnlock] = useState(false);

  // ----- Auth + Data fetching -----

  const fetchClaims = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setClaims(data as Claim[]);
    },
    [supabase]
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();
      if (!sessionUser) {
        router.push("/");
        return;
      }
      setUser(sessionUser);
      setAuthLoading(false);
      await fetchClaims(sessionUser.id);
      setClaimsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // ----- Helpers to read file text -----

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // ----- New Claim Submit -----

  const handleSubmitClaim = async () => {
    if (!user) return;
    if (!leaseFile) {
      setSubmitError("Please upload your lease document.");
      return;
    }
    if (!deductionFile && !deductionText.trim()) {
      setSubmitError(
        "Please upload a deductions document or paste your deductions text."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitStep("processing");

    try {
      const timestamp = Date.now();
      const leaseExt = leaseFile.name.split(".").pop() || "pdf";
      const leasePath = `${user.id}/${timestamp}_lease.${leaseExt}`;

      // Upload lease
      const { error: leaseUpErr } = await supabase.storage
        .from("claim-documents")
        .upload(leasePath, leaseFile);
      if (leaseUpErr) throw new Error(`Lease upload failed: ${leaseUpErr.message}`);

      const {
        data: { publicUrl: leaseUrl },
      } = supabase.storage.from("claim-documents").getPublicUrl(leasePath);

      // Upload deductions file if present
      let ledgerUrl: string | null = null;
      if (deductionFile) {
        const dedExt = deductionFile.name.split(".").pop() || "pdf";
        const dedPath = `${user.id}/${timestamp}_deductions.${dedExt}`;
        const { error: dedUpErr } = await supabase.storage
          .from("claim-documents")
          .upload(dedPath, deductionFile);
        if (dedUpErr) throw new Error(`Deduction upload failed: ${dedUpErr.message}`);
        const {
          data: { publicUrl },
        } = supabase.storage.from("claim-documents").getPublicUrl(dedPath);
        ledgerUrl = publicUrl;
      }

      // Create claim row
      const { data: newClaim, error: insertErr } = await supabase
        .from("claims")
        .insert({
          user_id: user.id,
          status: "analyzing" as const,
          lease_url: leaseUrl,
          ledger_url: ledgerUrl,
        })
        .select()
        .single();
      if (insertErr || !newClaim)
        throw new Error(`Failed to create claim: ${insertErr?.message}`);

      // Build text payloads
      let leaseTextPayload: string;
      if (leaseFile.type === "text/plain") {
        leaseTextPayload = await readFileAsText(leaseFile);
      } else {
        leaseTextPayload = `See uploaded file at ${leaseUrl}`;
      }

      let deductionTextPayload: string;
      if (deductionFile) {
        if (deductionFile.type === "text/plain") {
          deductionTextPayload = await readFileAsText(deductionFile);
        } else {
          deductionTextPayload = `See uploaded file at ${ledgerUrl}`;
        }
      } else {
        deductionTextPayload = deductionText;
      }

      // Call analysis API
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_id: newClaim.id,
          lease_text: leaseTextPayload,
          deduction_text: deductionTextPayload,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Analysis failed");
      }

      // Refetch the claim to get updated analysis
      const { data: updatedClaim } = await supabase
        .from("claims")
        .select("*")
        .eq("id", newClaim.id)
        .single();

      setSubmitStep("complete");

      // Short pause then navigate to detail
      setTimeout(() => {
        setSelectedClaim((updatedClaim as Claim) || (newClaim as Claim));
        setView("detail");
        resetNewClaimForm();
        if (user) fetchClaims(user.id);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setSubmitError(message);
      setSubmitStep("upload");
    } finally {
      setSubmitting(false);
    }
  };

  const resetNewClaimForm = () => {
    setLeaseFile(null);
    setDeductionFile(null);
    setDeductionText("");
    setSubmitStep("upload");
    setSubmitError(null);
  };

  // ----- Unlock polling -----

  const startUnlockPolling = useCallback(
    (claimId: string) => {
      setPollingUnlock(true);
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from("claims")
          .select("*")
          .eq("id", claimId)
          .single();
        if (data && (data as Claim).status === "paid") {
          clearInterval(interval);
          setPollingUnlock(false);
          setSelectedClaim(data as Claim);
          if (user) fetchClaims(user.id);
        }
      }, 5000);

      // Auto stop after 10 minutes
      setTimeout(() => {
        clearInterval(interval);
        setPollingUnlock(false);
      }, 10 * 60 * 1000);
    },
    [supabase, user, fetchClaims]
  );

  // ----- Download PDF -----

  const downloadPdf = async () => {
    if (!selectedClaim) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: selectedClaim.id }),
      });
      if (!res.ok) throw new Error("Failed to generate letter");
      const { analysis_results } = await res.json();
      generateDemandLetterPdf(analysis_results as AnalysisResults);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ----- Open checkout -----

  const openCheckout = () => {
    if (!selectedClaim || !user) return;
    const checkoutUrl = `${process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL}?checkout[custom][claim_id]=${selectedClaim.id}&checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || "")}`;
    window.open(checkoutUrl, "_blank");
    startUnlockPolling(selectedClaim.id);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // ----- Top Nav -----

  const renderNav = () => (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-7 w-7 text-brand-400" />
          <span className="text-lg font-bold text-white tracking-tight">
            DepositGuard AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-400 sm:inline-block">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );

  // ----- View: Claims List -----

  const renderClaimsList = () => (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Claims</h1>
        <button
          onClick={() => {
            resetNewClaimForm();
            setView("new");
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 hover:shadow-brand-500/30"
        >
          <Plus className="h-4 w-4" />
          New Claim
        </button>
      </div>

      {/* Claims grid */}
      {claimsLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
        </div>
      ) : claims.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
          <FileText className="h-12 w-12 text-slate-600" />
          <p className="text-slate-400 text-lg">
            No claims yet. Start by uploading your lease.
          </p>
          <button
            onClick={() => {
              resetNewClaimForm();
              setView("new");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            New Claim
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => {
            const analysis = claim.analysis_results;
            const location = analysis
              ? `${analysis.city}, ${analysis.state}`
              : null;
            return (
              <GlassCard
                key={claim.id}
                className="group cursor-pointer p-5 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                onClick={() => {
                  setSelectedClaim(claim);
                  setView("detail");
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">
                      {location || "Processing..."}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatDate(claim.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Recovery
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      {analysis?.total_recovery
                        ? formatCurrency(analysis.total_recovery)
                        : "--"}
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-400" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );

  // ----- View: New Claim -----

  const progressSteps = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Processing" },
    { key: "complete", label: "Analysis" },
  ] as const;

  const renderNewClaim = () => (
    <div className="animate-fade-in space-y-6">
      {/* Back */}
      <button
        onClick={() => {
          setView("list");
          resetNewClaimForm();
        }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to claims
      </button>

      <h1 className="text-2xl font-bold text-white">New Claim</h1>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {progressSteps.map((step, idx) => {
          const stepIdx = progressSteps.findIndex((s) => s.key === submitStep);
          const isActive = idx === stepIdx;
          const isComplete = idx < stepIdx;
          return (
            <div key={step.key} className="flex items-center gap-2">
              {idx > 0 && (
                <div
                  className={cn(
                    "h-px w-8 sm:w-12",
                    isComplete ? "bg-brand-400" : "bg-white/10"
                  )}
                />
              )}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-brand-400/50 bg-brand-400/10 text-brand-400"
                    : isComplete
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                    : "border-white/10 bg-white/[0.02] text-slate-500"
                )}
              >
                {isComplete ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                ) : (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-600 text-[10px] text-slate-600">
                    {idx + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {submitStep === "upload" && (
        <GlassCard className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FileDropZone
              label="Lease Document"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              file={leaseFile}
              onFile={setLeaseFile}
            />
            <FileDropZone
              label="Deductions / Itemized Statement"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              file={deductionFile}
              onFile={setDeductionFile}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Or type / paste your deductions here
            </label>
            <textarea
              value={deductionText}
              onChange={(e) => setDeductionText(e.target.value)}
              rows={5}
              placeholder="Paste the itemized deductions from your landlord..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/30 transition-colors"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmitClaim}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scale className="h-4 w-4" />
            )}
            Analyze My Deposit
          </button>
        </GlassCard>
      )}

      {/* Step: Processing */}
      {submitStep === "processing" && (
        <GlassCard className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
          <p className="text-lg font-medium text-white">
            Analyzing your documents...
          </p>
          <p className="text-sm text-slate-400 text-center max-w-md">
            Our AI is reviewing your lease and deductions against state and local
            tenant protection laws. This usually takes 30-60 seconds.
          </p>
        </GlassCard>
      )}

      {/* Step: Complete */}
      {submitStep === "complete" && (
        <GlassCard className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
          <p className="text-lg font-medium text-white">Analysis Complete!</p>
          <p className="text-sm text-slate-400">
            Redirecting to your results...
          </p>
        </GlassCard>
      )}
    </div>
  );

  // ----- View: Claim Detail -----

  const renderClaimDetail = () => {
    if (!selectedClaim) return null;
    const claim = selectedClaim;
    const analysis = claim.analysis_results;
    const isPaid = claim.status === "paid";
    const isUnpaid = claim.status === "unpaid";

    return (
      <div className="animate-fade-in space-y-6">
        {/* Back */}
        <button
          onClick={() => setView("list")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to claims
        </button>

        {/* Analyzing state */}
        {claim.status === "analyzing" && (
          <GlassCard className="flex flex-col items-center justify-center gap-4 px-6 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
            <p className="text-lg font-medium text-white">
              Analyzing your claim...
            </p>
            <p className="text-sm text-slate-400">
              This usually takes 30-60 seconds. Refresh to check progress.
            </p>
          </GlassCard>
        )}

        {/* Error state */}
        {claim.status === "error" && (
          <GlassCard className="flex flex-col items-center justify-center gap-4 px-6 py-20">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="text-lg font-medium text-white">
              Something went wrong
            </p>
            <p className="text-sm text-slate-400">
              We encountered an error analyzing your documents. Please try again
              or contact support.
            </p>
          </GlassCard>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {analysis.city}, {analysis.state}
                </h1>
                <p className="text-sm text-slate-400">
                  {analysis.property_address} &middot;{" "}
                  {formatDate(claim.created_at)}
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Total Deposit",
                  value: formatCurrency(analysis.total_deposit),
                  icon: <DollarSign className="h-5 w-5 text-brand-400" />,
                  color: "text-white",
                },
                {
                  label: "Illegal Deductions",
                  value: formatCurrency(analysis.illegal_deductions),
                  icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
                  color: "text-red-400",
                },
                {
                  label: "Statutory Penalties",
                  value: formatCurrency(analysis.statutory_penalties),
                  icon: <Scale className="h-5 w-5 text-yellow-400" />,
                  color: "text-yellow-400",
                },
                {
                  label: "Total Recovery",
                  value: formatCurrency(analysis.total_recovery),
                  icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
                  color: "text-emerald-400",
                },
              ].map((stat) => (
                <GlassCard
                  key={stat.label}
                  className="flex flex-col gap-3 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </span>
                    {stat.icon}
                  </div>
                  <span className={cn("text-2xl font-bold", stat.color)}>
                    {stat.value}
                  </span>
                </GlassCard>
              ))}
            </div>

            {/* Summary */}
            <GlassCard className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">
                Summary
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                {analysis.summary}
              </p>
            </GlassCard>

            {/* Deduction Breakdown */}
            <GlassCard className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Deduction Breakdown
              </h2>
              <div className="space-y-3">
                {analysis.deduction_analysis.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {item.description}
                          </span>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              classificationColors[item.classification] ||
                                "border-white/10 text-slate-400"
                            )}
                          >
                            {item.classification}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {item.reasoning}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-white whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Legal Citations */}
            <GlassCard className="relative overflow-hidden p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Legal Citations
              </h2>
              <div
                className={cn(
                  "space-y-2 transition-all",
                  isUnpaid && "select-none"
                )}
                style={isUnpaid ? { filter: "blur(8px)" } : undefined}
              >
                {analysis.statutes_cited.map((statute, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <Scale className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    <span className="text-sm text-slate-300">{statute}</span>
                  </div>
                ))}
              </div>
              {isUnpaid && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/40 backdrop-blur-sm">
                  <div className="text-center">
                    <Scale className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                    <p className="text-sm font-medium text-slate-300">
                      Unlock to view legal citations
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Demand Letter Preview */}
            <GlassCard className="relative overflow-hidden p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Demand Letter Preview
              </h2>
              <div
                className={cn(
                  "transition-all",
                  isUnpaid && "select-none"
                )}
                style={isUnpaid ? { filter: "blur(8px)" } : undefined}
              >
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-sans">
                    {analysis.demand_letter_preview}
                  </pre>
                </div>
              </div>
              {isUnpaid && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/40 backdrop-blur-sm">
                  <div className="text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                    <p className="mb-3 text-sm font-medium text-slate-300">
                      Unlock to view your demand letter
                    </p>
                    <button
                      onClick={openCheckout}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500"
                    >
                      <DollarSign className="h-4 w-4" />
                      $39 Unlock
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Action buttons */}
            {isUnpaid && (
              <GlassCard className="p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <h3 className="text-lg font-semibold text-white">
                    Unlock Full Report
                  </h3>
                  <p className="max-w-md text-sm text-slate-400">
                    Get access to the complete legal analysis, all statute
                    citations, and a professionally formatted demand letter ready
                    to send to your landlord.
                  </p>
                  <button
                    onClick={openCheckout}
                    disabled={pollingUnlock}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-brand-500/40 disabled:opacity-70"
                  >
                    {pollingUnlock ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Waiting for payment...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5" />
                        Unlock Full Report &mdash; $39
                      </>
                    )}
                  </button>
                  {pollingUnlock && (
                    <p className="text-xs text-slate-500">
                      Complete your payment in the checkout window. This page
                      will update automatically.
                    </p>
                  )}
                </div>
              </GlassCard>
            )}

            {isPaid && (
              <GlassCard className="p-6">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      Your Demand Letter is Ready
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Download a professionally formatted PDF demand letter to
                      send to your landlord.
                    </p>
                  </div>
                  <button
                    onClick={downloadPdf}
                    disabled={downloadingPdf}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Download Demand Letter PDF
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    );
  };

  // ----- Layout -----

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {renderNav()}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "list" && renderClaimsList()}
        {view === "new" && renderNewClaim()}
        {view === "detail" && renderClaimDetail()}
      </main>
    </div>
  );
}
