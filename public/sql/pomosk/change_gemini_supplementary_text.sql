begin;
update api_keys
set gemini_supplementary_text = $2
where user_id = $1;
commit;