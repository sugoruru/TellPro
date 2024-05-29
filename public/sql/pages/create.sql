begin;
-- ページの作成.
insert into pages (
        "id",
        "user_id",
        "title",
        "content",
        "like_count",
        "comment_count",
        "tags",
        "is_public",
        "date",
        "page_type"
    )
values ($1, $2, $3, $4, 0, 0, $5, $6, now(), $7);
-- タグの登録.
-- 一時テーブルの作成.
create temp table temp_tags (tag text) on commit drop;
insert into temp_tags (tag)
select unnest($5::text []);
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