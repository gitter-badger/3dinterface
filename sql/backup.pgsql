-- Clear database from previous tables (just in case...)
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Arrowclicked CASCADE;
DROP TABLE IF EXISTS CoinClicked CASCADE;
DROP TABLE IF EXISTS KeyboardEvent CASCADE;
DROP TABLE IF EXISTS ResetClicked CASCADE;
DROP TABLE IF EXISTS PreviousNextClicked CASCADE;
DROP TABLE IF EXISTS Hovered CASCADE;
DROP TABLE IF EXISTS Scene CASCADE;
DROP TABLE IF EXISTS Experiment CASCADE;
DROP TABLE IF EXISTS FpsCounter CASCADE;
DROP TABLE IF EXISTS PointerLocked CASCADE;
DROP TABLE IF EXISTS SwitchedLockOption CASCADE;

DROP TYPE IF EXISTS VECTOR3 CASCADE;
DROP TYPE IF EXISTS CAMERA CASCADE;
DROP TYPE IF EXISTS PREVIOUSNEXT CASCADE;

-- Elementary types
CREATE TYPE PREVIOUSNEXT AS ENUM(
    'p', 'n'
);

CREATE TYPE VECTOR3 AS(
    x REAL,
    y REAL,
    z REAL
);

CREATE TYPE CAMERA AS(
    position VECTOR3,
    target VECTOR3
);

-- Base tables
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name CHAR(50)
);

CREATE TABLE scene(
    id SERIAL PRIMARY KEY,
    name CHAR(50)
);

CREATE TABLE experiment(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users (id),
    scene_id SERIAL REFERENCES scene (id)
);

-- Init scene table
INSERT INTO scene(name) VALUES ('peachcastle');
INSERT INTO scene(name) VALUES ('bobomb');
INSERT INTO scene(name) VALUES ('coolcoolmountain');
INSERT INTO scene(name) VALUES ('whomp');

-- Events
CREATE TABLE arrowclicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

CREATE TABLE coinclicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    coin_id INTEGER
);

CREATE TABLE keyboardevent(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    camera CAMERA
);

CREATE TABLE resetclicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE previousnextclicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    previousnext PREVIOUSNEXT NOT NULL,
    time TIMESTAMP DEFAULT NOW(),
    camera CAMERA
);

CREATE TABLE hovered(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    start BOOLEAN NOT NULL,
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

CREATE TABLE fpscounter(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    fps REAL
);

CREATE TABLE pointerlocked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    locked BOOLEAN
);

CREATE TABLE switchedlockoption(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    locked BOOLEAN
);
