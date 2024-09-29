begin;
update sessions
set end_time = $2,
    is_interrupted = true
where id = $1;
commit;