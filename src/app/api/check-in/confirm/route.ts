import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeam } from "@/lib/supabase/server";
const schema=z.object({participantId:z.uuid(),eventId:z.uuid(),method:z.enum(["qr","manual"])});
export async function POST(req:Request){const auth=await requireTeam(["admin","check_in_agent"]);if(!auth)return NextResponse.json({error:"Non autorisé"},{status:401});const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Requête invalide"},{status:400});const {data,error}=await auth.supabase.rpc("perform_check_in",{p_participant_id:p.data.participantId,p_event_id:p.data.eventId,p_method:p.data.method});if(error)return NextResponse.json({error:error.message.includes("already_checked_in")?"TICKET DÉJÀ UTILISÉ":"Entrée impossible"},{status:409});return NextResponse.json({status:"checked_in",checkIn:data})}
