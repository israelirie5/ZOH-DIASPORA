import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/lib/validation";
import { sendTicketEmail } from "@/services/email";
import type { Event, Participant } from "@/types/database";

export async function POST(request: Request) {
  try {
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const supabase = createAdminClient();
    const input = parsed.data;
    const token = crypto.randomUUID();
    const { data, error } = await supabase.rpc("register_participant", {
      p_event_id: input.eventId, p_first_name: input.firstName, p_last_name: input.lastName,
      p_email: input.email, p_phone: input.phone, p_city: input.city,
      p_source: input.source || null, p_qr_token: token,
    });
    if (error) {
      if (error.message.includes("duplicate_registration")) return NextResponse.json({ error: "Une inscription existe déjà avec cette adresse email pour cet événement.", duplicate: true }, { status: 409 });
      if (error.message.includes("registration_full")) return NextResponse.json({ error: "INSCRIPTIONS COMPLÈTES" }, { status: 409 });
      if (error.message.includes("registration_closed")) return NextResponse.json({ error: "Les inscriptions sont actuellement fermées." }, { status: 409 });
      throw error;
    }
    const participant = (Array.isArray(data) ? data[0] : data) as Participant;
    const { data: event } = await supabase.from("events").select("*").eq("id", input.eventId).single();
    if (!event) throw new Error("Event missing after registration");
    let emailSent = true;
    try { await sendTicketEmail(participant, event as Event); }
    catch (emailError) { emailSent = false; console.error("ticket_email_failed", { participantId: participant.id, error: emailError }); }
    return NextResponse.json({ token: participant.qr_token, email: participant.email, emailSent }, { status: 201 });
  } catch (error) {
    console.error("registration_failed", error);
    return NextResponse.json({ error: "Une erreur est survenue. Veuillez réessayer." }, { status: 500 });
  }
}
