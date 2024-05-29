begin;
delete from comment_likes
where comment_id = $1
    and user_id = $2;
commit;