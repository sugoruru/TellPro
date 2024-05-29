select *
from likes
where user_id = $1
    and page_id = $2
    and page_type = $3;