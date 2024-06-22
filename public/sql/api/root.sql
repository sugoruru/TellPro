-- get the latest 3 notices
WITH notices_json AS (
    SELECT *
    FROM notices
    ORDER BY created_at DESC
    LIMIT 3
), -- get the trending articles
trending_articles AS (
    SELECT id,
        user_id,
        title,
        is_public,
        is_closed,
        tags,
        pages.like_count / (
            EXTRACT(
                EPOCH
                FROM AGE(now(), pages.date)
            ) / 86400 + 1
        ) AS trend
    FROM pages
    WHERE page_type = 'articles'
        AND is_public = true
    ORDER BY trend DESC
    LIMIT 5
), -- get the trending questions
trending_questions AS (
    SELECT id,
        user_id,
        title,
        is_public,
        is_closed,
        tags,
        pages.like_count / (
            EXTRACT(
                EPOCH
                FROM AGE(now(), pages.date)
            ) / 86400 + 1
        ) AS trend
    FROM pages
    WHERE page_type = 'questions'
        AND is_public = true
    ORDER BY trend DESC
    LIMIT 5
), -- get the user ids
combined_user_ids AS (
    SELECT DISTINCT user_id
    FROM trending_articles
    UNION
    SELECT DISTINCT user_id
    FROM trending_questions
),
-- get user details from the users table
users_json AS (
    SELECT *
    FROM users
    WHERE id IN (
            SELECT user_id
            FROM combined_user_ids
        )
)
SELECT json_build_object(
        'notices',
        (
            SELECT json_agg(notices_json)
            FROM notices_json
        ),
        'trending_articles',
        (
            SELECT json_agg(trending_articles)
            FROM trending_articles
        ),
        'trending_questions',
        (
            SELECT json_agg(trending_questions)
            FROM trending_questions
        ),
        'users',
        (
            SELECT json_agg(users_json)
            FROM users_json
        )
    ) AS root;