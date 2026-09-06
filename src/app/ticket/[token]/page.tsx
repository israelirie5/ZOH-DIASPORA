import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Ticket } from "@/components/ticket";
import type { Event, Participant } from "@/types/database";

export default async function TicketPage({ params }: { params: Promise<{token:string}> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const { data } = await createAdminClient().from("participants").select("*,events(*)").eq("qr_token",token).eq("registration_status","registered").single();
  if (!data) notFound();
  const participant = data as unknown as Participant & { events: Event };
  return <main className="min-h-screen bg-[#f7f7f2] px-4 py-10"><Ticket participant={participant} event={participant.events}/></main>;
}
