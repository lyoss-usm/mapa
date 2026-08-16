CREATE OR REPLACE FUNCTION poi_inherit_building_from_department()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.department_id IS NOT NULL THEN
    SELECT building_id INTO NEW.building_id
    FROM departments
    WHERE id = NEW.department_id;
  ELSE
    NEW.building_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
