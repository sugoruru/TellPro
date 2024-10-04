begin;
update api_keys
set name = $2
where user_id = $1;
commit;