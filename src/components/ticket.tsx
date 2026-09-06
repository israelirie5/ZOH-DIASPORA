import QRCode from "qrcode";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Event, Participant } from "@/types/database";

export async function Ticket({ participant, event }: { participant: Participant; event: Event }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const qr = await QRCode.toDataURL(`${site}/q/${participant.qr_token}`, { width: 360, margin: 1, errorCorrectionLevel: "H" });
  return <article className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white text-[#073f36] shadow-2xl">
    <header className="bg-[#073f36] p-6 text-white"><p className="font-black tracking-[.18em] text-[#ffd21c]">ZOH-HENAN</p><h1 className="mt-3 text-2xl font-black">DIASPORA TOUR 2026</h1><p className="mt-1 text-sm text-white/70">PASS INVITÉ</p></header>
    <div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#176652]">Participant</p><h2 className="text-2xl font-black">{participant.first_name} {participant.last_name}</h2><div className="my-5 grid grid-cols-2 gap-3 border-y py-4 text-sm"><div><b className="block">Événement</b>{event.city}, {event.country}</div><div><b className="block">Date</b>{format(new Date(`${event.event_date}T12:00:00`), "d MMMM yyyy", { locale: fr })}</div></div>
      {/* QR is generated from an opaque token URL only; it contains no personal data. */}<img src={qr} alt="QR Code sécurisé du ticket" className="mx-auto size-56"/><p className="mt-3 text-center text-sm font-semibold">Présentez ce QR Code à l’entrée.</p><p className="mt-4 text-center font-mono text-sm">{participant.ticket_number}</p>
    </div></article>;
}
