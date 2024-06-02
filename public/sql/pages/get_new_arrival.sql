select *
from pages
where page_type = $1
order by date desc
limit 30;