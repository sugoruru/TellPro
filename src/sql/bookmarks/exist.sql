select *
from bookmarks
where page_id = $1
    and user_id = $2
    and page_type = $3;