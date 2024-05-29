begin;
insert into comments (
        id,
        user_id,
        content,
        like_count,
        page_id,
        page_type,
        created_at
    )
values ($1, $2, $3, 0, $4, $5, now());
commit;