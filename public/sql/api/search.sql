with users as (
    select id,
        username,
        status_message,
        answer_score + page_score as score,
        is_admin,
        icon,
        atcoder_id,
        codeforces_id,
        x_id
    from users
    where (
            id like '%' || $1 || '%'
            or username like '%' || $1 || '%'
        )
        and is_banned = false
    limit 5
), articles as (
    select *
    from pages
    where title like '%' || $1 || '%'
        and is_public = true
        and page_type = 'articles'
    limit 5
)
select json_build_object(
        'users',
        (
            select json_agg(users)
            from users
        ),
        'articles',
        (
            select json_agg(articles)
            from articles
        )
    ) as search_json;