-- notificationsを取得
with notifications_json as (
    select *
    from notifications
    where user_id = (
            select id
            from users
            where mail = $1
        )
    order by created_at desc
),
user_last_seeing_notifications_at as (
    select last_seeing_notifications_at
    from users
    where mail = $1
),
comments_json as (
    select id,
        user_id,
        page_id,
        page_type
    from comments
    where id in (
            select split_part(notification_value, ' ', 3)
            from notifications_json
            where notification_type = 'comment'
                and user_id = (
                    select id
                    from users
                    where mail = $1
                )
        )
        and page_id in (
            select split_part(notification_value, ' ', 2)
            from notifications_json
            where notification_type = 'comment'
                and user_id = (
                    select id
                    from users
                    where mail = $1
                )
        )
        and page_type in (
            select split_part(notification_value, ' ', 1)
            from notifications_json
            where notification_type = 'comment'
                and user_id = (
                    select id
                    from users
                    where mail = $1
                )
        )
    ORDER BY created_at DESC
),
users_json as (
    select id,
        icon,
        username
    from users
    where id in (
            select user_id
            from comments_json
        )
),
page_titles_json as (
    select id,
        title
    from pages
    where id in (
            select page_id
            from comments_json
        )
        and page_type in (
            select page_type
            from comments_json
        )
)
select json_build_object(
        'notifications',
        (
            select json_agg(notifications_json)
            from notifications_json
        ),
        'last_seeing_notifications_at',
        (
            select last_seeing_notifications_at
            from user_last_seeing_notifications_at
        ),
        'comments',
        (
            select json_agg(comments_json)
            from comments_json
        ),
        'users',
        (
            select json_agg(users_json)
            from users_json
        ),
        'page_titles',
        (
            select json_agg(page_titles_json)
            from page_titles_json
        )
    ) as result;