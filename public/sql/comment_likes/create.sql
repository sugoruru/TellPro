begin;
insert into comment_likes (id, user_id, created_at, comment_id)
values ($1, $2, now(), $3);
commit;