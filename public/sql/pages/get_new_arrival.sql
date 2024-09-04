select id,
    user_id,
    title,
    is_public,
    is_closed,
    tags,
    date
from pages
where page_type = $1
    and is_public = true
order by date desc
limit 30;