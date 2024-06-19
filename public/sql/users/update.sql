begin;
UPDATE users
SET username = $1,
    icon = $2,
    status_message = $3,
    atcoder_id = $5,
    codeforces_id = $6,
    x_id = $7
WHERE id = $4;
commit;