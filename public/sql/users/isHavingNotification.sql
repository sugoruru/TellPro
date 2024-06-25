select count(*)
from notifications
where user_id = $1
    and created_at > (
        select last_seeing_notifications_at
        from users
        where id = $1
    );