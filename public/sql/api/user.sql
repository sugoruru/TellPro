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
articles as (
    select *
    from pages
    where user_id = $2
        and (
            $2 =(
                select id
                from users
                where mail = $1
            )
            or is_public = 'true'
        )
        and page_type = 'articles'
    order by date desc
),
questions as (
    select *
    from pages
    where user_id = $2
        and (
            $2 =(
                select id
                from users
                where mail = $1
            )
            or is_public = 'true'
        )
        and page_type = 'questions'
    order by date desc
),
problems as (
    select *
    from pages
    where user_id = $2
        and (
            $2 =(
                select id
                from users
                where mail = $1
            )
            or is_public = 'true'
        )
        and page_type = 'problems'
)
select json_build_object(
        'me',
        (
            select json_agg(me_json)
            from me_json
        ),
        'user',
        (
            select json_agg(user_json)
            from user_json
        ),
        'articles',
        (
            select json_agg(articles)
            from articles
        ),
        'questions',
        (
            select json_agg(questions)
            from questions
        ),
        'problems',
        (
            select json_agg(problems)
            from problems
        )
    ) as result;