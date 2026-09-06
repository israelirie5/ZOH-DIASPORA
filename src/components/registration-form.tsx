"use client";
import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import type { Event } from "@/types/database";

const sources = ["", "Réseaux sociaux", "Association", "Ambassade / institution", "Entreprise", "Un proche", "Client ZOH-HENAN", "Autre"];

export function RegistrationForm({ events }: { events: Event[] }) {
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setBusy(true); setError("");
    const body = Object.fromEntries(formData);
    const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, eventId, consent: body.consent === "on" }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    window.location.assign(`/confirmation?token=${encodeURIComponent(result.token)}`);
  }
  return <form action={submit} className="space-y-5" aria-busy={busy}>
    <div className="grid gap-4 sm:grid-cols-2"><Field name="firstName" label="Prénom" /><Field name="lastName" label="Nom" /></div>
    <Field name="email" label="Email" type="email" /><Field name="phone" label="Téléphone / WhatsApp" type="tel" /><Field name="city" label="Ville de résidence" />
    <fieldset><legend className="mb-3 font-bold">Événement souhaité</legend><div className="grid gap-3 sm:grid-cols-2">{events.map(e => <button key={e.id} type="button" onClick={()=>setEventId(e.id)} aria-pressed={eventId===e.id} className={`relative min-h-28 border-2 p-4 text-left ${eventId===e.id?"border-[#ffd21c] bg-[#fff9d9]":"border-slate-200"}`}><strong className="block text-xl uppercase">{e.city}</strong><span className="text-sm text-slate-600">{e.country} · {new Date(`${e.event_date}T12:00:00`).toLocaleDateString("fr-FR",{dateStyle:"long"})}</span>{eventId===e.id&&<Check className="absolute right-3 top-3 text-[#176652]" />}</button>)}</div></fieldset>
    <label className="block"><span className="mb-2 block font-bold">Comment nous avez-vous connu ?</span><select name="source" className="min-h-12 w-full border border-slate-300 px-3">{sources.map(s=><option key={s} value={s}>{s||"Sélectionner (facultatif)"}</option>)}</select></label>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
    <label className="flex items-start gap-3 text-sm leading-6"><input required name="consent" type="checkbox" className="mt-1 size-5 accent-[#176652]"/><span>J’accepte que mes informations soient utilisées par ZOH-HENAN dans le cadre de mon inscription au Diaspora Tour 2026.</span></label>
    {error&&<p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <button disabled={busy||!eventId} className="flex min-h-14 w-full items-center justify-center gap-2 bg-[#ffd21c] px-5 font-black text-[#073f36] disabled:cursor-not-allowed disabled:opacity-50">{busy?<><LoaderCircle className="animate-spin"/> CRÉATION DE VOTRE TICKET...</>:"RECEVOIR MON TICKET"}</button>
  </form>;
}
function Field({name,label,type="text"}:{name:string;label:string;type?:string}) { return <label className="block"><span className="mb-2 block font-bold">{label}</span><input required name={name} type={type} className="min-h-12 w-full border border-slate-300 px-3 outline-none focus:border-[#176652] focus:ring-2 focus:ring-[#176652]/20" /></label> }
