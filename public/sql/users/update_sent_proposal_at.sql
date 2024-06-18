begin;
update users
set sent_proposal_at = now()
where mail = $1;
commit;