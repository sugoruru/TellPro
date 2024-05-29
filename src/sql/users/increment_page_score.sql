begin;
update users
set page_score = page_score + 1
where id = $1;
commit;