-- 1,5,10,30,50,100,200,300
do $$ begin if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 1 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_A'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_A'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 5 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_B'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_B'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 10 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_C'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_C'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 30 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_D'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_D'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 50 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_E'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_E'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 100 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_F'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_F'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 200 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_G'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_G'
    );
end if;
if (
    select count(*)
    from pages
    where user_id = $1
        and page_type = 'articles'
        and is_public = true
) >= 300 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'A_H'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'A_H'
    );
end if;
end $$;