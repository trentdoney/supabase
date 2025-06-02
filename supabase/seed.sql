insert into meetups
  (title, country, launch_week, start_at, is_published)
values
  ('New York', 'USA', 'lw12', now(), true),
  ('London', 'UK', 'lw12', now(), true),
  ('Singapore', 'Singapore', 'lw12', now(), true);

insert into public.launch_weeks (id) values ('lw14');

-- Insert mock error codes for testing
insert into content.error (code, service, http_status_code, message)
values
  (
    'test_code',
    (select id from content.service where name = 'AUTH'),
    500,
    'This is a test error message'
  ),
  (
    'test_code2',
    (select id from content.service where name = 'AUTH'),
    429,
    'Too many requests'
  ),
  (
    'test_code3',
    (select id from content.service where name = 'REALTIME'),
    500,
    'A realtime error message'
  );

-- Insert mock troubleshooting articles for testing
insert into public.troubleshooting_entries (
    title,
    topics,
    keywords,
    checksum,
    api,
    errors,
    github_id,
    github_url
) values (
    'Troubleshooting 1',
    array ['topic 1', 'topic2'],
    array ['keyword 1', 'keyword2'],
    'abcdefghilmnopqrstuvwxyzABCDEFGHIJKLMN',
    jsonb_build_object(
        'sdk', jsonb_build_array('api1', 'api2')
    ),
    array [
        jsonb_build_object(
            'code', 'test_code'
        )
    ],
    'D-abcdefghij',
    'https://github.com/supabase/discussions/1'
), (
    'Troubleshooting 2',
    array ['topic 3', 'topic4'],
    null,
    'abcdefghilmnopqrstuvwxyzBCDEFGHIJKLMNO',
    null,
    array [
        jsonb_build_object(
            'code', 'test_code'
        ),
        jsonb_build_object(
            'code', 'test_code2'
        )
    ],
    'D-bcdefghijk',
    'https://github.com/supabase/discussions/2'
), (
    'Troubleshooting 3',
    array ['topic 1'],
    null,
    'abcdefghilmnopqrstuvwxyzCDEFGHIJKLMNOP',
    null,
    null,
    'D-cdefghijkl',
    'https://github.com/supabase/discussions/3'
);

select * from content.sync_troubleshooting_error_relationship(
    jsonb_build_array(
        jsonb_build_object(
            'error_code', 'test_code',
            'troubleshooting_id', (
                select id
                from public.troubleshooting_entries
                where title = 'Troubleshooting 1'
            )
        ),
        jsonb_build_object(
            'error_code', 'test_code',
            'troubleshooting_id', (
                select id
                from public.troubleshooting_entries
                where title = 'Troubleshooting 2'
            )
        ),
        jsonb_build_object(
            'error_code', 'test_code2',
            'troubleshooting_id', (
                select id
                from public.troubleshooting_entries
                where title = 'Troubleshooting 2'
            )
        )
    )
);
