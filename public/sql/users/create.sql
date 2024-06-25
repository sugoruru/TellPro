begin;
insert into users (
        "id",
        "username",
        "mail",
        "icon",
        "status_message",
        "answer_score",
        "page_score"
    )
values ($1, $2, $3, $4, $5, 0, 0);
commit;