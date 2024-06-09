begin;
-- pages.like_countを減らす
update pages
set like_count = like_count - 1
where id in (
        select page_id
        from likes
        where user_id = $1
    );
-- comments.like_countを減らす
update comments
set like_count = like_count - 1
where id in (
        select comment_id
        from comment_likes
        where user_id = $1
    );
-- users.page_scoreを減らす
update users
set page_score = page_score - 1
where id in (
        select user_id
        from pages
        where id in (
                select page_id
                from likes
                where user_id = $1
            )
    );
-- ユーザーを削除する
delete from users
where id = $1;
commit;