begin;
update comments
set content = $1
where id = $2
    and user_id = $3
    and page_id = $4;
commit;