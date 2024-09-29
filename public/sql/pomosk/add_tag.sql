begin;
insert into tags (id, user_id, tag_name, created_at)
values ($1, $2, $3, now());
commit;