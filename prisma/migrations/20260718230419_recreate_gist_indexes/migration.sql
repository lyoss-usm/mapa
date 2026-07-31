-- CreateIndex
CREATE INDEX "buildings_geometry_idx" ON "buildings" USING GIST ("geometry");

-- CreateIndex
CREATE INDEX "departments_geometry_idx" ON "departments" USING GIST ("geometry");

-- CreateIndex
CREATE INDEX "pois_geometry_idx" ON "pois" USING GIST ("geometry");
