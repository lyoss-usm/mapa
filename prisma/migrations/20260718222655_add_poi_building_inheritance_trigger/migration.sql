-- DropIndex
DROP INDEX "buildings_geometry_gist_idx";

-- DropIndex
DROP INDEX "departments_geometry_gist_idx";

-- DropIndex
DROP INDEX "pois_geometry_gist_idx";


CREATE OR REPLACE FUNCTION poi_inherit_building_from_department()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.department_id IS NOT NULL THEN
    SELECT building_id INTO NEW.building_id
    FROM departments
    WHERE id = NEW.department_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_poi_inherit_building ON pois;

CREATE TRIGGER trg_poi_inherit_building
BEFORE INSERT OR UPDATE OF department_id ON pois
FOR EACH ROW
EXECUTE FUNCTION poi_inherit_building_from_department();