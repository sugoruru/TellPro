-- likesの個数によって実績を解除する
-- 1,10,50,100でif文をする
do $$ begin if (
    select count(*)
    from likes
    where user_id = $1
        and page_id in (
            select id
            from pages
            where user_id != $1
        );
) >= 1 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'G_A'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'G_A'
    );
end if;
if (
    select count(*)
    from likes
    where user_id = $1
        and page_id in (
            select id
            from pages
            where user_id != $1
        );
) >= 10 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'G_B'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'G_B'
    );
end if;
if (
    select count(*)
    from likes
    where user_id = $1
        and page_id in (
            select id
            from pages
            where user_id != $1
        );
) >= 50 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'G_C'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'G_C'
    );
end if;
if (
    select count(*)
    from likes
    where user_id = $1
        and page_id in (
            select id
            from pages
            where user_id != $1
        );
) >= 100 then
insert into achievement (id, user_id, achievement_name)
select gen_random_uuid(),
    $1,
    'G_D'
where not exists (
        select 1
        from achievement
        where user_id = $1
            and achievement_name = 'G_D'
    );
end if;
end $$;