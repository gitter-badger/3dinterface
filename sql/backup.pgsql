DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS arrowclicked CASCADE;
DROP TABLE IF EXISTS coinclicked CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name char(50)
);

CREATE TABLE arrowclicked(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users (id),
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

CREATE TABLE coinclicked(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users (id),
    time TIMESTAMP DEFAULT NOW(),
    coin_id INTEGER
);
