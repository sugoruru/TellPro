begin;
update gemini
set gemini_text = $1,
    created_at = now()
where user_id = $2;
commit;