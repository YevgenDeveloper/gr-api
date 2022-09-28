ALTER TABLE Chat
DROP COLUMN IF EXISTS ip;
ALTER TABLE Shows DROP constraint shows_redundancy_check;
ALTER TABLE Shows ADD constraint shows_redundancy_check check(redundancy >= 0 AND redundancy <= 12);
