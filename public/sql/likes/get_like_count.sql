select count(*)
from likes
where user_id = $1
    and page_id in (
        select id
        from pages
        where user_id != $1
    );