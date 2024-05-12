-- ブックマークを削除する
DELETE FROM "Bookmarks"
WHERE "userID" = $1 OR "pageUserID" = $1;
-- 消えるユーザーのいいねしていたページのいいね数を減らす
UPDATE "Pages"
SET "likeCount" = "likeCount" - 1
WHERE "ID" IN (
    SELECT "pageID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'pages'
) AND "userID" IN (
    SELECT "pageUserID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'pages'
);
-- 消えるユーザーのいいねしていた質問のいいね数を減らす
UPDATE "Questions"
SET "likeCount" = "likeCount" - 1
WHERE "ID" IN (
    SELECT "pageID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'questions'
) AND "userID" IN (
    SELECT "pageUserID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'questions'
);
-- 消えるユーザーのいいねしていたコメントのいいね数を減らす
UPDATE "Comments"
SET "likeCount" = "likeCount" - 1
WHERE "ID" IN (
    SELECT "pageID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'comments'
) AND "userID" IN (
    SELECT "pageUserID"
    FROM "Likes"
    WHERE "userID" = $1 AND "URLType" = 'comments'
);
-- いいねを削除する
DELETE FROM "Likes"
WHERE "userID" = $1 OR "pageUserID" = $1;
-- コメントを削除する
DELETE FROM "Comments"
WHERE "userID" = $1 OR "pageUserID" = $1;
-- ページのタグを削除する
WITH deleted_tags AS (
    SELECT UNNEST("tags") AS tag_name, COUNT(*) AS tag_count
    FROM "Pages"
    WHERE "userID" = $1
    GROUP BY UNNEST("tags")
)
UPDATE "Tags" t
SET "pageCount" = "pageCount" - dt.tag_count
FROM deleted_tags dt
WHERE t."name" = dt.tag_name;
-- 質問のタグを削除する
WITH deleted_tags AS (
    SELECT UNNEST("tags") AS tag_name, COUNT(*) AS tag_count
    FROM "Questions"
    WHERE "userID" = $1
    GROUP BY UNNEST("tags")
)
UPDATE "Tags" t
SET "questionCount" = "questionCount" - dt.tag_count
FROM deleted_tags dt
WHERE t."name" = dt.tag_name;
-- タグが0件のものを削除する
DELETE FROM "Tags" WHERE "pageCount"=0 AND "questionCount"=0;
-- ぺージを削除する
DELETE FROM "Pages" WHERE "userID" = $1;
-- 質問を削除する
DELETE FROM "Questions" WHERE "userID" = $1;
-- ユーザーを削除する
DELETE FROM "Users" WHERE "ID" = $1;