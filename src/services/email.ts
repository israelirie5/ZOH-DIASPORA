import "server-only";
import { Resend } from "resend";
import type { Event, Participant } from "@/types/database";
import { serverEnv } from "@/lib/env";

export async function sendTicketEmail(participant: Participant, event: Event) {
  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("Service email non configuré.");
  const ticketUrl = `${env.NEXT_PUBLIC_SITE_URL}/ticket/${participant.qr_token}`;
  return new Resend(env.RESEND_API_KEY).emails.send({
    from: env.EMAIL_FROM,
    to: participant.email,
    subject: "Votre ticket — ZOH-HENAN Diaspora Tour 2026",
    html: `<div style="font-family:Arial;color:#073f36;max-width:600px;margin:auto"><h1>ZOH-HENAN</h1><h2>Diaspora Tour 2026</h2><p>Bonjour ${escapeHtml(participant.first_name)},</p><p>Votre inscription est confirmée pour <strong>${escapeHtml(event.city)}</strong>, le ${escapeHtml(event.event_date)}.</p><p>Présentez simplement le QR Code affiché sur votre téléphone à l’entrée.</p><p><a style="background:#ffd21c;color:#073f36;padding:16px 22px;display:inline-block;font-weight:bold;text-decoration:none" href="${ticketUrl}">AFFICHER MON TICKET</a></p><p>ZOH-HENAN GOUJI IMMOBILIER</p></div>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}
