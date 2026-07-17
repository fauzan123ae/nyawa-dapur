-- Performance index: speed up ingredients lookup by household_id
-- Used by getDashboard() and getIngredients()
CREATE INDEX IF NOT EXISTS idx_ingredients_household_id ON ingredients(household_id);

-- Composite index for filtered queries (excludes soft-deleted)
CREATE INDEX IF NOT EXISTS idx_ingredients_household_status ON ingredients(household_id, status);
