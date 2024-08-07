with numbered_tags as (
    select *,
        page_count + question_count + problem_count as total_count,
        row_number() over (
            order by page_count + question_count + problem_count desc
        ) as row_num
    from tags
)
select *
from numbered_tags
where row_num > (($1 - 1) * 30)
    AND row_num <= ($1 * 30);