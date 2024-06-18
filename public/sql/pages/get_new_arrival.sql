select id,
    user_id,
    title,
    is_public,
    is_closed,
    tags
from pages
where page_type = $1
order by date desc
limit 30;