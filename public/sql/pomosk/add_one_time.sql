begin;
-- one_time_keysの中でcreated_atが現在時刻より10分以上前のものを削除
delete from one_time_keys
where created_at < now() - interval '10 minutes';
-- $1をkeyとしてone_time_keysに新しいレコードを追加
insert into one_time_keys (key, created_at)
values ($1, now());
commit;