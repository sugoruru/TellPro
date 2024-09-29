begin;
delete from tasks
where id = $1;
commit;