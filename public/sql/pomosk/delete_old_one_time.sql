begin;
-- 古いone_time_keysのレコードを削除
delete from one_time_keys
where created_at < now() - interval '10 minutes';
commit;