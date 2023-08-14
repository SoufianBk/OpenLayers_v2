CREATE OR REPLACE
FUNCTION public.tripsfct(
            z integer, x integer, y integer)
RETURNS bytea
AS $$
	WITH bounds AS (
		SELECT ST_TileEnvelope(z, x, y) AS geom
	),
	val AS (
		SELECT mmsi, asMVTGeom(transform(trip, 3857), (bounds.geom)::stbox) as geom_times
		FROM Ships, bounds
		LIMIT 100
	),
	mvtgeom AS(
		SELECT mmsi as id, (geom_times).geom, (geom_times).times
		FROM val
	)
SELECT ST_AsMVT(mvtgeom) FROM mvtgeom
                                  $$
    LANGUAGE 'sql'
STABLE
PARALLEL SAFE;