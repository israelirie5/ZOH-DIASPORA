export type Role = "admin" | "check_in_agent" | "viewer";
export type RegistrationStatus = "registered" | "cancelled" | "waiting_list";

export interface Event {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  venue: string | null;
  event_date: string;
  event_time: string | null;
  registration_open: boolean;
  registration_limit: number | null;
  is_active: boolean;
}

export interface Participant {
  id: string;
  event_id: string;
  ticket_number: string;
  qr_token: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  source: string | null;
  registration_status: RegistrationStatus;
  checked_in: boolean;
  registered_at: string;
  checked_in_at: string | null;
}
