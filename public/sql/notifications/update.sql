begin;
-- notificationsのcreated_atが15日以上前のものを削除
delete from notifications
where created_at < now() - interval '15 days';
-- last_seeing_notifications_atを更新
update users
set last_seeing_notifications_at = now()
where mail = $1;
commit;