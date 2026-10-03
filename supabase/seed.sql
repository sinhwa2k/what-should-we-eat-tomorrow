-- run after schema.sql
do $$
declare
  d record;
  v_plan uuid;
  v_dish uuid;
  r record;
begin
  for r in
    select * from (values
      ('2026-10-03'::date, 'lunch',  1, '새우 마늘 오일 파스타'),
      ('2026-10-03', 'lunch',  2, '빠삭 군만두'),
      ('2026-10-03', 'dinner', 1, '채끝 스테이크'),
      ('2026-10-03', 'dinner', 2, '아스파라거스구이'),
      ('2026-10-03', 'dinner', 3, '된장찌개'),
      ('2026-10-04', 'lunch',  1, '외식'),
      ('2026-10-04', 'dinner', 1, '소고기 감자 카레라이스'),
      ('2026-10-04', 'dinner', 2, '계란후라이'),
      ('2026-10-05', 'lunch',  1, '전 찌개'),
      ('2026-10-05', 'lunch',  2, '감자채볶음'),
      ('2026-10-05', 'dinner', 1, '소고기 뭇국'),
      ('2026-10-05', 'dinner', 2, '계란말이')
    ) as t(date, slot, position, label)
  loop
    insert into meal_plans (date, slot) values (r.date, r.slot)
      on conflict (date, slot) do nothing;
    select id into v_plan from meal_plans where date = r.date and slot = r.slot;

    v_dish := null;
    if r.label <> '외식' then
      select id into v_dish from dishes where name = r.label;
      if v_dish is null then
        insert into dishes (name) values (r.label) returning id into v_dish;
      end if;
    end if;

    insert into meal_items (plan_id, dish_id, label, position)
      values (v_plan, v_dish, r.label, r.position);
  end loop;
end $$;
