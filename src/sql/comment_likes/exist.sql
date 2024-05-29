select *
from comment_likes
where user_id = $1
    and comment_id = $2;