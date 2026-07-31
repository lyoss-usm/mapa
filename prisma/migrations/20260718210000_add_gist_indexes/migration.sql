CREATE INDEX IF NOT EXISTS buildings_geometry_gist_idx ON buildings USING GIST (geometry);
CREATE INDEX IF NOT EXISTS departments_geometry_gist_idx ON departments USING GIST (geometry);
CREATE INDEX IF NOT EXISTS pois_geometry_gist_idx ON pois USING GIST (geometry);