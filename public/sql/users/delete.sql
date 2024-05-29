begin;
delete from users
where id = $1;
commit;