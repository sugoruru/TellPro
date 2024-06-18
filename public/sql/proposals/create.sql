begin;
insert into proposals ("id", "title", "content", "user", "created_at")
values ($1, $2, $3, $4, now());
commit;