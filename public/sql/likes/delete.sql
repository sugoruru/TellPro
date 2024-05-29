begin;
delete from likes
where page_id = $1
    and page_type = $2
    and user_id = $3;
commit;