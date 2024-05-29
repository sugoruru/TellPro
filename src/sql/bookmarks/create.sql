begin;
insert into bookmarks (id, user_id, page_id, created_at, page_type)
values ($1, $2, $3, now(), $4);
commit;