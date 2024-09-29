begin;
update sessions
set end_time = $2
where id = $1;
commit;