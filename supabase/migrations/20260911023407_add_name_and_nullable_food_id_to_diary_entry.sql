alter table diary_entry
alter column food_id
drop not null;

alter table diary_entry
add column name text;

update diary_entry
set
  name = food.name
from
  food
where
  food.id = diary_entry.food_id;

alter table diary_entry
alter column name
set not null;
