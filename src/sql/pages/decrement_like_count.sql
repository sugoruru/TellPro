begin;
update pages
set like_count = like_count - 1
where id = $1
    and page_type = $2
    and user_id = $3;
commit;