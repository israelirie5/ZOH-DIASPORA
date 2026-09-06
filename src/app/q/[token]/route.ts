import { redirect } from "next/navigation";
export async function GET(_:Request,{params}:{params:Promise<{token:string}>}) { const {token}=await params; redirect(`/ticket/${encodeURIComponent(token)}`); }
