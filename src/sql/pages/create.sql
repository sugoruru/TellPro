INSERT INTO "Pages" ("ID", "userID", "title", "content", "likeCount", "commentCount", "isPublic", "date", "tags") VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7);
WITH tag_data AS (
    SELECT unnest($8::text[]) AS tag_name
)
INSERT INTO "Tags" ("name", "pageCount")
SELECT tag_name, 0
FROM tag_data
WHERE NOT EXISTS (
    SELECT 1
    FROM "Tags"
    WHERE "name" = tag_name
);
UPDATE "Tags" SET "pageCount"="pageCount"+1 WHERE "name" IN ($7:csv);