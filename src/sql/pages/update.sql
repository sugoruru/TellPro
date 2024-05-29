begin;
-- タグの更新.
-- タグの削除.
-- 一時テーブルの作成.
create temp table temp_tags (tag text) on commit drop;
insert into temp_tags (tag)
select unnest(
        (
            select tags
            from pages
            where id = $5
                and user_id = $6
                and page_type = $7
        )
    );
-- 削除.
update tags
set page_count = tags.page_count - 1
where name in (
        select tag
        from temp_tags
    );
-- どっちも0の場合は削除.
delete from tags
where page_count = 0
    and question_count = 0;
-- ページの更新.
update pages
set title = $1,
    content = $2,
    tags = $3,
    is_public = $4,
    date = now()
where id = $5
    and user_id = $6
    and page_type = $7;
-- タグの追加.
-- 一時テーブルの作成.
drop table if exists temp_tags;
create temp table temp_tags (tag text) on commit drop;
insert into temp_tags (tag)
select unnest(
        (
            select tags
            from pages
            where id = $5
                and user_id = $6
                and page_type = $7
        )
    );
-- アップサート操作.
insert into tags (name, image, page_count, question_count)
select tag,
    'local',
    case
        when $7 = 'articles' then 1
        else 0
    end,
    case
        when $7 = 'questions' then 1
        else 0
    end
from temp_tags on conflict (name) do
update
set page_count = case
        when $7 = 'articles' then tags.page_count + 1
        else tags.page_count
    end,
    question_count = case
        when $7 = 'questions' then tags.question_count + 1
        else tags.question_count
    end;
commit;