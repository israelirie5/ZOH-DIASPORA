insert into public.events(slug,name,country,city,ticket_prefix,event_date,event_time,registration_limit)
values
('paris-2026','ZOH-HENAN Diaspora Tour Paris','France','Paris','PAR','2026-09-12','14:00',500),
('milan-2026','ZOH-HENAN Diaspora Tour Milan','Italie','Milan','MIL','2026-09-19','14:00',500)
on conflict(slug) do update set name=excluded.name,country=excluded.country,city=excluded.city,event_date=excluded.event_date;
