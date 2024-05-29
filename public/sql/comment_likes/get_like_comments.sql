select cl.comment_id
from comment_likes cl
    inner join comments c on cl.comment_id = c.id
where cl.user_id = $1
    and c.page_id = $2
    and c.page_type = $3;