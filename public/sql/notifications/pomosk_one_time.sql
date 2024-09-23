begin;
insert into notifications (
        id,
        user_id,
        notification_type,
        created_at,
        notification_value
    )
values ($1, $2, 'pomosk_one_time', now(), $3);
commit;