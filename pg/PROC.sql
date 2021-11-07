CREATE OR REPLACE FUNCTION add_genre_show(uid UUID, g TEXT) RETURNS BOOLEAN AS
$$
BEGIN
  IF NOT EXISTS(SELECT * FROM Genres WHERE name like lower(g)) THEN
    INSERT INTO Genres VALUES(lower(g));
  END IF;
  INSERT INTO shows_genres VALUES(uid, lower(g));
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
