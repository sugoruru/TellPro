begin;
update users
set last_login_at = now()
where mail = $1;
commit;