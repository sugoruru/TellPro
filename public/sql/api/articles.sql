with me_json as (
    select *
    from users
    where mail = $1
),
user_json as (
    select *
    from users
    where id = $2
),
page_json as (
    select *
    from pages
    where id = $3
        and page_type = $4
),
is_liked as (
    select *
    from likes
    where page_id = $3
        and user_id = (
            select id
            from users
            where mail = $1
        )
),
is_bookmarked as (
    select *
    from bookmarks
    where page_id = $3
        and user_id = (
            select id
            from users
            where mail = $1
        )
),
comments as (
    select *
    from comments
    where page_id = $3
        and page_type = $4
    ORDER BY created_at DESC
),
comments_user as (
    select distinct user_id
    from comments
),
comments_user_json as (
    select *
    from users
    where id in (
            select user_id
            from comments_user
        )
),
comments_like as (
    select cl.comment_id
    from comment_likes cl
        inner join comments c on cl.comment_id = c.id
    where cl.user_id = (
            select id
            from users
            where mail = $1
        )
        and c.page_id = $3
        and c.page_type = $4
)
select json_build_object(
        'me',
        (
            select json_agg(me_json)
            from me_json
        ),
        'pageUser',
        (
            select json_agg(user_json)
            from user_json
        ),
        'page',
        (
            select json_agg(page_json)
            from page_json
        ),
        'isLiked',
        (
            select json_agg(is_liked)
            from is_liked
        ),
        'isBookmarked',
        (
            select json_agg(is_bookmarked)
            from is_bookmarked
        ),
        'comments',
        (
            select json_agg(comments)
            from comments
        ),
        'commentsUser',
        (
            select json_agg(comments_user_json)
            from comments_user_json
        ),
        'commentsLike',
        (
            select json_agg(comments_like)
            from comments_like
        )
    ) as res;