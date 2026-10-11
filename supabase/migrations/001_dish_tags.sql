-- run once in Supabase SQL Editor
alter table dishes add column if not exists tags text[] not null default '{}';

-- existing dishes were all home cooking
update dishes set tags = '{요리}' where tags = '{}';
