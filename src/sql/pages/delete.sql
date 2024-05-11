UPDATE "Tags" SET "pageCount"="pageCount"-1 WHERE "name" IN ($1:csv);
DELETE FROM "Tags" WHERE "pageCount"=0 AND "questionCount"=0;
UPDATE "Users" SET "pageScore"="pageScore" - (SELECT "likeCount" FROM "Pages" WHERE "ID" = $2 AND "userID" = $3) WHERE "ID"=$3;
DELETE FROM "Likes" WHERE "pageID" = $2 AND "pageUserID" = $3 AND "URLType"='pages';
DELETE FROM "Bookmarks" WHERE "pageID" = $2 AND "pageUserID" = $3 AND "URLType"='pages';
DELETE FROM "Pages" WHERE "ID"=$2 AND "userID"=$3;
DELETE FROM "Comments" WHERE "pageID"=$2 AND "pageUserID"=$3 AND "URLType"='pages';