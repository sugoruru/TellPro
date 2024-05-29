begin;
delete from comments
where id = $1
    and user_id = $2
    and page_type = $3;
commit;