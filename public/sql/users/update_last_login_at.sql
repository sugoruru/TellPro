begin;
-- 通知を作成
-- いいねの通知を作成
-- 15日以上前の通知を削除
delete from notifications
where created_at < now() - interval '15 days';
-- userのlast_login_atを更新
update users
set last_login_at = now()
where mail = $1;
commit;