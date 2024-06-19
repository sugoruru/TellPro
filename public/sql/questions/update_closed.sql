begin;
update pages
set is_closed = $3
where id = $1
    and user_id = $2;
commit;