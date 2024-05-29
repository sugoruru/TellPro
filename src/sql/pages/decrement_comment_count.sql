begin;
update pages
set comment_count = comment_count - 1
where id = $1
    and page_type = $2;
commit;