import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email;

    if (!email) {
      return new Response("No customer email found", { status: 400 });
    }

const { data, error: supabaseError } = await supabase
  .from("profiles")
  .update({
    has_paid: true,
    paid_at: new Date().toISOString(),
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : null,
  })
  .eq("email", email)
  .select("id, email, has_paid, paid_at, stripe_customer_id");

if (supabaseError) {
  console.error("Supabase update error:", supabaseError);
  return new Response("Supabase update failed", { status: 500 });
}

console.log("Updated profiles:", data);
  }

  return new Response("ok", { status: 200 });
});

