begin;
insert into reports (
        "id",
        "user_id",
        "reported_user_id",
        "report_value",
        "created_at"
    )
values ($1, $2, $3, $4, now());
commit;