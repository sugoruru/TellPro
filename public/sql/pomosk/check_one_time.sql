-- $1をkeyとしてone_time_keysの中にレコードが存在するか確認
select *
from one_time_keys
where key = $1;