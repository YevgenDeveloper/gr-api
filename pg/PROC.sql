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
CREATE OR REPLACE FUNCTION getshows(starts DATE)
RETURNS SETOF Shows AS
$$
DECLARE res Shows;
BEGIN
  FOR i in 0..6 LOOP
    FOR res IN
      SELECT * FROM Shows WHERE starts_at::date <= starts + i AND MOD(
        (extract(epoch from starts + i) -
          extract(epoch from starts_at::date))::bigint,
        (redundancy * 604800)::bigint) = 0
      LOOP
      RETURN NEXT res;
    END LOOP;
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql;
