begin;
insert into sessions (
        id,
        user_id,
        start_time,
        end_time,
        is_interrupted,
        tag_id,
        is_break
    )
values ($1, $2, $3, null, false, $5, $4);
commit;