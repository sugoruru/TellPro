with my_tags as (
    select *
    from tags
    where user_id = $1
),
my_tasks as (
    select *
    from tasks
    where user_id = $1
),
my_sessions as (
    select *
    from sessions
    where user_id = $1
    order by start_time desc
)
select json_build_object(
        'tags',
        (
            select json_agg(my_tags)
            from my_tags
        ),
        'tasks',
        (
            select json_agg(my_tasks)
            from my_tasks
        ),
        'sessions',
        (
            select json_agg(my_sessions)
            from my_sessions
        )
    ) as res;