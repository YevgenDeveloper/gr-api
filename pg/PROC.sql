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
CREATE OR REPLACE FUNCTION register(username TEXT, password TEXT, role TEXT)
RETURNS TEXT AS
$$
DECLARE
  u_id TEXT;
BEGIN
  IF NOT EXISTS(SELECT * FROM Roles where lower(name) like lower(role)) THEN
    RAISE NOTICE 'The role % does not exist', role;
  END IF;
  INSERT INTO Users VALUES(
    uuid_generate_v4(),
    username,
    crypt(password, gen_salt('bf', 10)), lower(role))
    RETURNING id INTO u_id;
  RETURN u_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION login(usernam TEXT, passwd TEXT)
RETURNS SETOF Users AS
$$
  SELECT * FROM Users WHERE username = usernam AND
    password = crypt(passwd, password);
$$ LANGUAGE sql;
CREATE OR REPLACE FUNCTION getshows(starts DATE, nbr INTEGER)
RETURNS TABLE(
  id TEXT, name TEXT, dj TEXT, starts_at TIMESTAMP,
  ends_at TIMESTAMP, redundancy INTEGER, added_by TEXT
) AS $$
DECLARE res record;
BEGIN
  FOR i in 0..nbr LOOP
    FOR res IN
      SELECT a.* FROM Shows a WHERE a.starts_at::date <= starts + i AND
      a.redundancy <> 0 AND MOD(
        (extract(epoch from starts + i) -
          extract(epoch from a.starts_at::date))::bigint,
        (a.redundancy * 604800)::bigint) = 0 ORDER BY starts_at
      LOOP
        id := res.id;
        name := res.name;
        dj := res.dj;
        starts_at := (starts + i)::date + res.starts_at::time;
        ends_at := (starts + i + (res.ends_at::date - res.starts_at::date))::date
          + res.ends_at::time;
        redundancy := res.redundancy;
        added_by := res.added_by;
      RETURN NEXT;
      END LOOP;
    FOR res IN
      SELECT a.* FROM Shows a WHERE a.starts_at::date = starts + i
        AND a.redundancy = 0
      LOOP
        RAISE NOTICE '%', res.id;
        id := res.id;
        name := res.name;
        dj := res.dj;
        starts_at := (starts + i)::date + res.starts_at::time;
        ends_at := (starts + i + (res.ends_at::date - res.starts_at::date))::date
          + res.ends_at::time;
        redundancy := res.redundancy;
        added_by := res.added_by;
        RETURN NEXT;
      END LOOP;
    END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql;
