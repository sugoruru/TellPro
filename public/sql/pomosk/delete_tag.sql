begin;
delete from tags
where id = $1;
commit;