-- userのlast_loginを更新
begin;
update users
set last_login_at = now()
where mail = $1;
commit;
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
        and page_type = 'articles'
),
questions as (
    select *
    from pages
    where user_id = $2
        and page_type = 'questions'
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
        )
    ) as result;