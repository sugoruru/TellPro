begin;
update users
set sent_report_at = now()
where mail = $1;
commit;