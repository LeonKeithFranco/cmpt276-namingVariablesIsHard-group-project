CREATE TABLE Users
    (id SERIAL PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     highscore INTEGER);
