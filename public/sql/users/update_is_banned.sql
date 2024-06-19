begin;
update users
set is_banned = $1
where id = $2;
commit;