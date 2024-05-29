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
            and page_type = $2
        order by created_at desc
    ) b on p.id = b.page_id;