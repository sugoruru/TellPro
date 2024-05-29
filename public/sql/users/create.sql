begin;
insert into users (
        "id",
        "username",
        "mail",
        "icon",
        "status_message",
        "answer_score",
        "page_score",
        "last_login_at"
    )
values ($1, $2, $3, $4, $5, 0, 0, now());
commit;