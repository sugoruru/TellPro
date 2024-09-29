begin;
insert into gemini (id, user_id, gemini_text, created_at)
values ($1, $2, $3, now());
commit;