begin;
-- 通知を作成する
insert into notifications (
        id,
        user_id,
        notification_type,
        created_at,
        notification_value
    )
select $6,
    user_id,
    'comment',
    now(),
    concat($5, ' ', $4, ' ', $1)
from pages
where id = $4
    and page_type = $5
    and user_id <> $2;
-- commentを作成する
insert into comments (
        id,
        user_id,
        content,
        like_count,
        page_id,
        page_type,
        created_at
    )
values ($1, $2, $3, 0, $4, $5, now());
commit;