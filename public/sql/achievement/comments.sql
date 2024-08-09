-- 1,5,10,30
do $$ begin if (
    select count(*)
    from comments
    where user_id = $1
) >= 1 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'C_A'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'C_A'
    );
end if;
if (
    select count(*)
    from comments
    where user_id = $1
) >= 5 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'C_B'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'C_B'
    );
end if;
if (
    select count(*)
    from comments
    where user_id = $1
) >= 10 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'C_C'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'C_C'
    );
end if;
if (
    select count(*)
    from comments
    where user_id = $1
) >= 30 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'C_D'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'C_D'
    );
end if;
end $$;