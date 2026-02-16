export interface DeductionItem {
  description: string;
  amount: number;
  classification: "ILLEGAL" | "LEGAL" | "DISPUTED";
  reasoning: string;
  statute_reference?: string;
}

export interface AnalysisResults {
  summary: string;
  total_deposit: number;
  total_deductions: number;
  illegal_deductions: number;
  legal_deductions: number;
  amount_owed: number;
  statutory_penalties: number;
  total_recovery: number;
  state: string;
  city: string;
  statutes_cited: string[];
  deduction_analysis: DeductionItem[];
  landlord_name: string;
  landlord_address: string;
  tenant_name: string;
  property_address: string;
  lease_start_date: string;
  lease_end_date: string;
  demand_letter_preview: string;
}

export interface Claim {
  id: string;
  user_id: string;
  status: "analyzing" | "unpaid" | "paid" | "error";
  lease_url: string | null;
  ledger_url: string | null;
  analysis_results: AnalysisResults | null;
  state_jurisdiction: string | null;
  lemon_squeezy_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export type DashboardView = "list" | "new" | "detail";
