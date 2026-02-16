import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { claim_id } = body as { claim_id: string };

    if (!claim_id) {
      return NextResponse.json(
        { error: "Missing required field: claim_id" },
        { status: 400 }
      );
    }

    const { data: claim, error: fetchError } = await supabase
      .from("claims")
      .select("*")
      .eq("id", claim_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !claim) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      );
    }

    if (claim.status !== "paid") {
      return NextResponse.json(
        { error: "Payment required. Please complete payment to access the full analysis and demand letter." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: claim.analysis_results,
    });
  } catch (error) {
    console.error("Generate letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate letter. Please try again." },
      { status: 500 }
    );
  }
}
