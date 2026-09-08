import { Building2, MapPin, Plane } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationForm } from "@/components/registration-form";
import type { Event } from "@/types/database";

// Events are fetched from Supabase at request time. This also prevents the
// production build from requiring runtime-only Supabase secrets while prerendering.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await createAdminClient().from("events").select("*").eq("is_active", true).order("event_date");
  const events = (data ?? []) as Event[];
  return (
    <main className="min-h-screen bg-[#073f36] text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-12 px-5 py-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-10 lg:px-16">
        <div>
          <div className="mb-12 flex items-center gap-3 font-bold tracking-[.15em]">
            <span className="grid size-11 place-items-center rounded-sm bg-[#ffd21c] text-[#073f36]"><Building2 /></span>
            ZOH-HENAN
          </div>
          <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[.24em] text-[#ffd21c]"><Plane size={18} /> France · Italie</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[.92] tracking-tight sm:text-6xl lg:text-7xl">DIASPORA<br />TOUR <span className="text-[#ffd21c]">2026</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">Investir dans l’immobilier en Côte d’Ivoire en toute sécurité.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {events.map((event) => (
              <article key={event.city} className="border-l-4 border-[#ffd21c] bg-white/8 p-5">
                <div className="mb-2"><MapPin className="text-[#ffd21c]" size={21} /></div>
                <h2 className="text-2xl font-extrabold uppercase">{event.city}</h2>
                <p className="text-sm text-white/65">{event.country}</p>
                <p className="mt-3 font-semibold">{new Date(`${event.event_date}T12:00:00`).toLocaleDateString("fr-FR",{dateStyle:"long"})}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="rounded-sm bg-white p-6 text-[#073f36] shadow-2xl sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#176652]">Inscription gratuite</p><h2 className="mt-3 text-3xl font-black">Recevez votre invitation.</h2><p className="mb-7 mt-3 text-slate-600">Votre ticket nominatif sera envoyé automatiquement par email.</p>
          {events.length ? <RegistrationForm events={events}/> : <p role="alert" className="bg-orange-50 p-4 text-orange-900">Aucun événement n’est actuellement ouvert.</p>}
        </aside>
      </section>
    </main>
  );
}
