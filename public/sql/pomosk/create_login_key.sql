begin;
delete from api_keys
where user_id = $2;
insert into api_keys (key, created_at, user_id, name)
values ($1, now(), $2, $3);
commit;