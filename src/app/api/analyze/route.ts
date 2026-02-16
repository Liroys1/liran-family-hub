import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a Senior Paralegal specializing in tenant rights and security deposit disputes. Your task is to analyze a rental lease agreement and landlord's deduction list to identify illegal charges.

Instructions:
1. Extract the city and state from the lease
2. Compare each deduction against local and state security deposit laws
3. Distinguish between 'Normal Wear & Tear' (paint fading, small nail holes, carpet wear after 5+ years of tenancy) and 'Actual Damage'
4. Cite specific state statutes (e.g., TX Prop Code §92.109, CA Civil Code §1950.5)
5. Calculate if the tenant is owed the full deposit amount plus statutory penalties (2x or 3x damages where applicable)
6. Generate a professional demand letter preview

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary of findings",
  "total_deposit": 0,
  "total_deductions": 0,
  "illegal_deductions": 0,
  "legal_deductions": 0,
  "amount_owed": 0,
  "statutory_penalties": 0,
  "total_recovery": 0,
  "state": "XX",
  "city": "City Name",
  "statutes_cited": ["Statute 1", "Statute 2"],
  "deduction_analysis": [
    {
      "description": "Item description",
      "amount": 0,
      "classification": "ILLEGAL|LEGAL|DISPUTED",
      "reasoning": "Explanation",
      "statute_reference": "Specific statute"
    }
  ],
  "landlord_name": "Name from lease",
  "landlord_address": "Address from lease",
  "tenant_name": "Name from lease",
  "property_address": "Address from lease",
  "lease_start_date": "YYYY-MM-DD",
  "lease_end_date": "YYYY-MM-DD",
  "demand_letter_preview": "Full text of demand letter"
}`;

export async function POST(request: Request) {
  let claim_id: string | undefined;

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
    const { claim_id: bodyClaimId, lease_text, deduction_text } = body as {
      claim_id: string;
      lease_text: string;
      deduction_text: string;
    };
    claim_id = bodyClaimId;

    if (!claim_id || !lease_text || !deduction_text) {
      return NextResponse.json(
        { error: "Missing required fields: claim_id, lease_text, deduction_text" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Lease Agreement:\n${lease_text}\n\nLandlord's Deduction List:\n${deduction_text}`,
        },
      ],
    });

    // Extract text from Claude's response
    let rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Handle potential markdown code blocks wrapping the JSON
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      rawText = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(rawText);

    // Update the claim row with analysis results
    const { error: updateError } = await supabase
      .from("claims")
      .update({
        analysis_results: parsed,
        status: "unpaid",
        state_jurisdiction: parsed.state,
      })
      .eq("id", claim_id);

    if (updateError) {
      console.error("Failed to update claim:", updateError);
      return NextResponse.json(
        { error: "Failed to save analysis results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      claim_id,
      analysis: parsed,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // Attempt to mark the claim as errored
    if (claim_id) {
      try {
        const supabase = createServerSupabaseClient();
        await supabase
          .from("claims")
          .update({ status: "error" })
          .eq("id", claim_id);
      } catch (updateErr) {
        console.error("Failed to update claim status to error:", updateErr);
      }
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
