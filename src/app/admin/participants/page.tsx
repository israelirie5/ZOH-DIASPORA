import { redirect } from "next/navigation";
import { requireTeam } from "@/lib/supabase/server";

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const auth = await requireTeam(["admin", "viewer"]);
  if (!auth) redirect("/login");
  const { q = "", page = "1" } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  let query = auth.supabase.from("participants").select("id,first_name,last_name,email,phone,city,ticket_number,registered_at,registration_status,checked_in,events(city)", { count: "exact" }).order("registered_at", { ascending: false }).range((current - 1) * 25, current * 25 - 1);
  if (q.trim()) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,ticket_number.ilike.%${q}%`);
  const { data, count } = await query;
  return <main className="min-h-screen bg-[#f7f7f2] p-5 text-[#073f36]"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-3 py-6"><h1 className="text-3xl font-black">Participants</h1><a href="/api/admin/export" className="bg-[#ffd21c] px-5 py-3 font-black">EXPORTER CSV</a></div><form className="mb-5"><label className="sr-only" htmlFor="q">Rechercher</label><input id="q" name="q" defaultValue={q} placeholder="Nom, email, téléphone ou ticket" className="min-h-12 w-full max-w-xl border bg-white px-4"/></form><div className="overflow-x-auto bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#073f36] text-white"><tr>{["Nom","Email","Téléphone","Ville","Événement","Ticket","Inscription","Présence"].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{data?.map(p=><tr key={p.id} className="border-b"><td className="p-3 font-bold">{p.first_name} {p.last_name}</td><td className="p-3">{p.email}</td><td className="p-3">{p.phone}</td><td className="p-3">{p.city}</td><td className="p-3">{(p.events as unknown as {city:string})?.city}</td><td className="p-3 font-mono">{p.ticket_number}</td><td className="p-3">{new Date(p.registered_at).toLocaleDateString("fr-FR")}</td><td className="p-3 font-bold">{p.checked_in?"Présent":"Absent"}</td></tr>)}</tbody></table></div><p className="mt-4 text-sm">Page {current} · {count??0} participant(s)</p></div></main>;
}
