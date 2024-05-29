select *
from comments
where page_id = $1
    and page_type = $2
ORDER BY created_at DESC;