-- content.error has a composite primary key of (service, code) but an ID
-- is needed for foreign key relationships
alter table content.error
add column id uuid unique default gen_random_uuid();

create index if not exists idx_error_id_nondeleted
on content.error(id)
where deleted_at is null;

-- Create table to track many-to-many relationship between troubleshooting
-- articles and error codes
create table if not exists content.troubleshooting_error_relationship (
  error_id uuid not null references content.error(id),
  troubleshooting_id uuid not null references public.troubleshooting_entries(id),
  primary key (error_id, troubleshooting_id)
);

-- Also create the reverse composite index so it can be filtered both ways
create index if not exists idx_troubleshooting_error
on content.troubleshooting_error_relationship(troubleshooting_id, error_id);

alter table content.troubleshooting_error_relationship
enable row level security;

grant all on table content.troubleshooting_error_relationship to service_role;

create or replace function content.sync_troubleshooting_error_relationship(
    error_map jsonb
)
returns void
set search_path = ''
as $$
    with matches as (
        select
            error.id as error_id,
            relationship.troubleshooting_id
        from content.error
        cross join lateral (
            select
                (elem->>'troubleshooting_id')::uuid as troubleshooting_id,
                elem->>'error_code' as error_code
            from jsonb_array_elements(error_map) as elem
        ) relationship
        where error.code = relationship.error_code
    ),
    -- insert new relationships
    inserts as (
        insert into content.troubleshooting_error_relationship(
            error_id,
            troubleshooting_id
        )
        select
            error_id,
            troubleshooting_id
        from matches
        on conflict do nothing
    )
    -- delete relationships not in input array
    delete from content.troubleshooting_error_relationship relationship
    where not exists (
        select 1
        from matches
        where matches.error_id = relationship.error_id
        and matches.troubleshooting_id = relationship.troubleshooting_id
    );
$$ language sql;
