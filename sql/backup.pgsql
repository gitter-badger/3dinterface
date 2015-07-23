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
DROP TABLE IF EXISTS Coin CASCADE;

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
CREATE TABLE Users(
    id SERIAL PRIMARY KEY,
    worker_id varchar(50),
    age INTEGER,
    male BOOLEAN
);

CREATE TABLE Scene(
    id SERIAL PRIMARY KEY,
    name CHAR(50)
);

CREATE TABLE Experiment(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES Users (id),
    scene_id SERIAL REFERENCES Scene (id)
);

CREATE TABLE Coin(
    exp_id SERIAL REFERENCES Experiment (id),
    coin_id INTEGER
);

-- Init scene table
INSERT INTO Scene(name) VALUES ('peachcastle');
INSERT INTO Scene(name) VALUES ('bobomb');
INSERT INTO Scene(name) VALUES ('coolcoolmountain');
INSERT INTO Scene(name) VALUES ('whomp');

-- Events
CREATE TABLE ArrowClicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

CREATE TABLE CoinClicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    coin_id INTEGER
);

CREATE TABLE KeyboardEvent(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    camera CAMERA
);

CREATE TABLE ResetClicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE PreviousNextClicked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    previousnext PREVIOUSNEXT NOT NULL,
    time TIMESTAMP DEFAULT NOW(),
    camera CAMERA
);

CREATE TABLE Hovered(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    start BOOLEAN NOT NULL,
    time TIMESTAMP DEFAULT NOW(),
    arrow_id INTEGER
);

CREATE TABLE FpsCounter(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    fps REAL
);

CREATE TABLE PointerLocked(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    locked BOOLEAN
);

CREATE TABLE SwitchedLockOption(
    id SERIAL PRIMARY KEY,
    exp_id SERIAL REFERENCES Experiment (id),
    time TIMESTAMP DEFAULT NOW(),
    locked BOOLEAN
);
