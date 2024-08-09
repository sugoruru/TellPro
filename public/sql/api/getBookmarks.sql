with articles as (
    select p.id,
        p.user_id,
        p.title,
        p.is_public,
        p.tags
    from pages p
        inner join (
            select page_id
            from bookmarks
            where user_id = $1
                and page_type = 'articles'
            order by created_at desc
        ) b on p.id = b.page_id
),
questions as (
    select p.id,
        p.user_id,
        p.title,
        p.is_public,
        p.tags
    from pages p
        inner join (
            select page_id
            from bookmarks
            where user_id = $1
                and page_type = 'questions'
            order by created_at desc
        ) b on p.id = b.page_id
),
problems as (
    select p.id,
        p.user_id,
        p.title,
        p.is_public,
        p.tags
    from pages p
        inner join (
            select page_id
            from bookmarks
            where user_id = $1
                and page_type = 'problems'
            order by created_at desc
        ) b on p.id = b.page_id
)
select json_build_object(
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