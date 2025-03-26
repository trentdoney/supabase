create schema if not exists content;
grant usage on schema content to anon, authenticated;

create schema if not exists internal;

create function internal.set_deleted_flag()
set search_path = ''
returns trigger as $$
begin
  if new.deleted_at is not null then
    new.deleted := true;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create function internal.set_updated_time()
set search_path = ''
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;
