begin;
-- users.page_scoreの更新.
update users
set page_score = page_score - (
        select count(*)
        from likes
        where page_id = $1
            and page_type = $3
    )
where id = $2;
-- ページの削除.
delete from pages
where id = $1
    and user_id = $2
    and page_type = $3;
-- タグの削除.
-- 一時テーブルの作成.
create temp table temp_tags (tag text) on commit drop;
insert into temp_tags (tag)
select unnest($4::text []);
-- 削除.
update tags
set page_count = case
        when $3 = 'articles' then page_count - 1
        else page_count
    end,
    question_count = case
        when $3 = 'questions' then question_count - 1
        else question_count
    end,
    problem_count = case
        when $3 = 'problems' then problem_count - 1
        else problem_count
    end
where name in (
        select tag
        from temp_tags
    );
-- どっちも0の場合は削除.
delete from tags
where page_count = 0
    and question_count = 0
    and problem_count = 0;
commit;