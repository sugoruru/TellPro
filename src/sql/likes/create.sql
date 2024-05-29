begin;
insert into likes (id, user_id, created_at, page_type, page_id)
values ($1, $2, now(), $3, $4);
commit;