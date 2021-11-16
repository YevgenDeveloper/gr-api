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
