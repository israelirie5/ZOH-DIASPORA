create extension if not exists pgcrypto;
create type public.user_role as enum ('admin','check_in_agent','viewer');
create type public.registration_status as enum ('registered','cancelled','waiting_list');
create type public.check_in_method as enum ('qr','manual');

create table public.events (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  country text not null, city text not null, venue text, ticket_prefix text not null unique,
  event_date date not null, event_time time, registration_open boolean not null default true,
  registration_limit integer check (registration_limit is null or registration_limit > 0),
  ticket_counter bigint not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, full_name text not null,
  role public.user_role not null default 'viewer', active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.participants (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id),
  ticket_number text not null unique, qr_token uuid not null unique, first_name text not null,
  last_name text not null, email text not null, phone text not null, city text not null, source text,
  registration_status public.registration_status not null default 'registered', checked_in boolean not null default false,
  registered_at timestamptz not null default now(), checked_in_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index participants_event_email_unique on public.participants(event_id, lower(email));
create index participants_search_idx on public.participants(event_id, last_name, first_name);
create table public.check_ins (
  id uuid primary key default gen_random_uuid(), participant_id uuid not null references public.participants(id),
  event_id uuid not null references public.events(id), agent_id uuid not null references auth.users(id),
  method public.check_in_method not null, checked_in_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique(participant_id,event_id)
);
create table public.audit_logs (
  id bigint generated always as identity primary key, action text not null, actor_id uuid references auth.users(id),
  participant_id uuid references public.participants(id), metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create or replace function public.register_participant(p_event_id uuid,p_first_name text,p_last_name text,p_email text,p_phone text,p_city text,p_source text,p_qr_token uuid)
returns setof public.participants language plpgsql security definer set search_path=public as $$
declare e public.events; n bigint; result public.participants;
begin
  select * into e from public.events where id=p_event_id for update;
  if e.id is null or not e.is_active or not e.registration_open then raise exception 'registration_closed'; end if;
  if exists(select 1 from public.participants where event_id=p_event_id and lower(email)=lower(trim(p_email))) then raise exception 'duplicate_registration'; end if;
  if e.registration_limit is not null and (select count(*) from public.participants where event_id=p_event_id and registration_status='registered') >= e.registration_limit then raise exception 'registration_full'; end if;
  update public.events set ticket_counter=ticket_counter+1,updated_at=now() where id=p_event_id returning ticket_counter into n;
  insert into public.participants(event_id,ticket_number,qr_token,first_name,last_name,email,phone,city,source)
  values(p_event_id,'ZH-'||e.ticket_prefix||'-'||lpad(n::text,6,'0'),p_qr_token,trim(p_first_name),trim(p_last_name),lower(trim(p_email)),trim(p_phone),trim(p_city),p_source) returning * into result;
  insert into public.audit_logs(action,participant_id) values('registration_created',result.id);
  return next result;
exception when unique_violation then raise exception 'duplicate_registration';
end $$;
revoke all on function public.register_participant(uuid,text,text,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.register_participant(uuid,text,text,text,text,text,text,uuid) to service_role;

create or replace function public.team_role() returns public.user_role language sql stable security definer set search_path=public as $$
 select role from public.profiles where id=auth.uid() and active limit 1
$$;
create or replace function public.perform_check_in(p_participant_id uuid,p_event_id uuid,p_method public.check_in_method)
returns public.check_ins language plpgsql security definer set search_path=public as $$
declare result public.check_ins;
begin
 if public.team_role() not in ('admin','check_in_agent') then raise exception 'forbidden'; end if;
 if not exists(select 1 from public.participants where id=p_participant_id and event_id=p_event_id and registration_status='registered') then raise exception 'invalid_ticket'; end if;
 insert into public.check_ins(participant_id,event_id,agent_id,method) values(p_participant_id,p_event_id,auth.uid(),p_method) returning * into result;
 update public.participants set checked_in=true,checked_in_at=result.checked_in_at,updated_at=now() where id=p_participant_id and event_id=p_event_id and registration_status='registered';
 insert into public.audit_logs(action,actor_id,participant_id,metadata) values('check_in_created',auth.uid(),p_participant_id,jsonb_build_object('method',p_method));
 return result;
exception when unique_violation then raise exception 'already_checked_in';
end $$;

alter table public.events enable row level security; alter table public.participants enable row level security;
alter table public.check_ins enable row level security; alter table public.profiles enable row level security; alter table public.audit_logs enable row level security;
create policy "public active events" on public.events for select using (is_active);
create policy "team profiles self" on public.profiles for select to authenticated using (id=auth.uid());
create policy "team participants read" on public.participants for select to authenticated using (public.team_role() in ('admin','check_in_agent','viewer'));
create policy "team events manage" on public.events for all to authenticated using (public.team_role()='admin') with check (public.team_role()='admin');
create policy "admin participants manage" on public.participants for all to authenticated using (public.team_role()='admin') with check (public.team_role()='admin');
create policy "team checkins read" on public.check_ins for select to authenticated using (public.team_role() in ('admin','check_in_agent','viewer'));
create policy "admin logs read" on public.audit_logs for select to authenticated using (public.team_role()='admin');
