import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Verify HMAC-SHA256 signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");

    if (digest !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    // Only process paid orders
    if (
      body.meta.event_name !== "order_created" ||
      body.data.attributes.status !== "paid"
    ) {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const claim_id = body.meta.custom_data.claim_id as string;
    const user_id = body.meta.custom_data.user_id as string;

    if (!claim_id || !user_id) {
      return NextResponse.json(
        { error: "Missing custom_data fields" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    const { error: updateError } = await supabase
      .from("claims")
      .update({
        status: "paid",
        lemon_squeezy_order_id: body.data.id,
      })
      .eq("id", claim_id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Failed to update claim after payment:", updateError);
      return NextResponse.json(
        { error: "Failed to update claim" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
