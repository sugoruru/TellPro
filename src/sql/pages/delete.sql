begin;
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
set page_count = tags.page_count - 1
where name in (
        select tag
        from temp_tags
    );
-- どっちも0の場合は削除.
delete from tags
where page_count = 0
    and question_count = 0;
commit;