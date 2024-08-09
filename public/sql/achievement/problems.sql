-- 1,5,10,30
do $$ begin if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'problems'
        and is_public = true
) >= 1 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'P_A'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'P_A'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'problems'
        and is_public = true
) >= 5 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'P_B'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'P_B'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'problems'
        and is_public = true
) >= 10 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'P_C'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'P_C'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'problems'
        and is_public = true
) >= 30 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'P_D'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'P_D'
    );
end if;
end $$;