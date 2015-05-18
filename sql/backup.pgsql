DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS arrowclicked CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name char(50)
);

-- Create dummy user
INSERT INTO users(name) VALUES('Thomas');

CREATE TABLE arrowclicked(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users (id),
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

