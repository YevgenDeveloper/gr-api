CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE Roles(
  name TEXT PRIMARY KEY,
  permissions INTEGER check(permissions >= 0 AND permissions <= 100)
);
CREATE TABLE Users(
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT references Roles(name)
);
CREATE TABLE Genres(
  name TEXT PRIMARY KEY
);
CREATE TABLE Chat(
  id SERIAL PRIMARY KEY,
  ts timestamp,
  ip INET,
  username TEXT,
  message TEXT
);
CREATE TABLE Events(
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  facebook TEXT,
  added_by UUID references Users(id)
);
CREATE TABLE Shows(
  id UUID PRIMARY KEY,
  name TEXT,
  dj TEXT,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  redundancy INTEGER check(redundancy >= 0 AND redundancy <= 4),
  color VARCHAR(7),
  added_by UUID references Users(id)
);
CREATE TABLE shows_genres(
  id UUID references Shows(id),
  genre TEXT references Genres(name),
  PRIMARY KEY(id, genre)
);
INSERT INTO Roles(name, permissions) VALUES ('admin', 100);
INSERT INTO Roles(name, permissions) VALUES ('mod', 75);
INSERT INTO Roles(name, permissions) VALUES ('dj', 50);
