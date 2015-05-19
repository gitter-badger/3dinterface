DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS arrowclicked CASCADE;
DROP TABLE IF EXISTS coinclicked CASCADE;
DROP TABLE IF EXISTS keyboardevent CASCADE;

DROP TYPE IF EXISTS VECTOR3 CASCADE;
DROP TYPE IF EXISTS CAMERA CASCADE;
DROP TYPE IF EXISTS DIRECTION CASCADE;

CREATE TYPE VECTOR3 AS(
    x FLOAT,
    y FLOAT,
    z FLOAT
);

CREATE TYPE CAMERA AS(
    position VECTOR3,
    target VECTOR3
);

CREATE TYPE DIRECTION AS ENUM(
    'n',
    'ne',
    'e',
    'se',
    's',
    'sw',
    'w',
    'nw'
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name CHAR(50)
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

CREATE TABLE keyboardevent(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users (id),
    time TIMESTAMP DEFAULT NOW(),
    direction DIRECTION,
    camera CAMERA
);
