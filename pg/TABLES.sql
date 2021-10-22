CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE Users(
  id UUID PRIMARY KEY,
  username VARCHAR(64) UNIQUE,
  password VARCHAR(128)
);
