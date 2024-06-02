SELECT *,
    pages.like_count / (
        EXTRACT(
            EPOCH
            FROM AGE(now(), pages.date)
        ) / 86400 + 1
    ) AS trend
FROM pages
WHERE page_type = $1
ORDER BY trend ASC
LIMIT 5;