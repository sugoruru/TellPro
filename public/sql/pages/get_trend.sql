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
WHERE page_type = $1
    and is_public = true
ORDER BY trend ASC
LIMIT 5;