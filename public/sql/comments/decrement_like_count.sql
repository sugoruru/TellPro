begin;
update comments
set like_count = like_count - 1
where id = $1
    and user_id = $2;
commit;