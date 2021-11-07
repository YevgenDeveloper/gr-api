CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE Roles(
  id SERIAL PRIMARY KEY,
  name TEXT,
  permissions INTEGER check(permissions >= 0 AND permissions <= 100)
);
CREATE TABLE Users(
  id UUID PRIMARY KEY,
  username VARCHAR(64) UNIQUE,
  password VARCHAR(128),
  role INTEGER references Roles(id)
);
CREATE TABLE Genres(
  name TEXT PRIMARY KEY
);
CREATE TABLE Shows(
  id UUID PRIMARY KEY,
  name TEXT,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  redundancy INTEGER check(redundancy >= 0 AND redundancy <= 4),
  color VARCHAR(7),
  u_id UUID references Users(id)
);
CREATE TABLE shows_genres(
  id UUID references Shows(id),
  genre TEXT references Genres(name),
  PRIMARY KEY(id, genre)
);
INSERT INTO Roles(name, permissions) VALUES ('admin', 100);
INSERT INTO Roles(name, permissions) VALUES ('mod', 75);
INSERT INTO Roles(name, permissions) VALUES ('dj', 50);
