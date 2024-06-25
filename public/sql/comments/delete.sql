begin;
delete from comments
where id = $1
    and user_id = $2
    and page_type = $3
    and page_id = $4;
delete from notifications
where notification_type = 'comment'
    and notification_value = concat($3, ' ', $4, ' ', $1);
commit;