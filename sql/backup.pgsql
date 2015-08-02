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
DROP TABLE IF EXISTS CoinCombination CASCADE;

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
    worker_id VARCHAR(50),
    age VARCHAR(10),
    rating INT,
    lasttime INT,
    male BOOLEAN
);

CREATE TABLE Scene(
    id SERIAL PRIMARY KEY,
    name CHAR(50)
);

CREATE TABLE CoinCombination(
    id SERIAL PRIMARY KEY,
    scene_id SERIAL REFERENCES Scene (id),
    coin_1 INTEGER,
    coin_2 INTEGER,
    coin_3 INTEGER,
    coin_4 INTEGER,
    coin_5 INTEGER,
    coin_6 INTEGER,
    coin_7 INTEGER,
    coin_8 INTEGER
);

CREATE TABLE Experiment(
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES Users (id),
    coin_combination_id SERIAL REFERENCES CoinCombination (id),
    template VARCHAR(30)
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

-- Fill with example
INSERT INTO Users(rating) VALUES(3);
INSERT INTO Users(rating) VALUES(3);
INSERT INTO Users(rating) VALUES(3);
INSERT INTO Users(rating) VALUES(3);

INSERT INTO CoinCombination(scene_id) VALUES (2);
INSERT INTO CoinCombination(scene_id) VALUES (3);
INSERT INTO CoinCombination(scene_id) VALUES (4);
INSERT INTO CoinCombination(scene_id) VALUES (4);

INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(1, 1, '1');
INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(2, 1, '2');
-- INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(2, 1, '3');

INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(1, 2, '2');
INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(2, 2, '3');

INSERT INTO Experiment(user_id, coin_combination_id, template) VALUES(3, 4, '3');

SELECT * FROM Experiment;

-- PROTO request
SELECT DISTINCT CoinCombination.id AS id, all_template as template, CoinCombination.scene_id as scene_id
FROM Experiment, CoinCombination,
    (SELECT * FROM generate_series(1,3) all_template) ali

WHERE
    Experiment.coin_combination_id = CoinCombination.id AND
    CoinCombination.scene_id IN(

        SELECT CoinCombination.scene_id as scene_id

        FROM Users, Experiment, CoinCombination

        WHERE
            Experiment.user_id = Users.id AND
            Experiment.coin_combination_id = CoinCombination.id AND
            Users.rating = 3 AND
            Users.id != 3 AND
            all_template NOT IN (
                SELECT CAST(template AS INTEGER)
                FROM Experiment, Users
                WHERE Experiment.user_id = Users.id AND Users.id = 3
            ) AND
            CoinCombination.scene_id NOT IN(
                SELECT scene_id FROM Experiment, Users
                WHERE Experiment.user_id = Users.id AND Users.id = 3
            )

        GROUP BY CoinCombination.scene_id

        HAVING COUNT(DISTINCT Experiment.template) < 3

)

EXCEPT

SELECT CoinCombination.id AS id, CAST(Experiment.template AS INTEGER) as template, CoinCombination.scene_id as scene_id
FROM Experiment, CoinCombination
WHERE
    Experiment.coin_combination_id = CoinCombination.id AND
    CoinCombination.scene_id IN(

        SELECT CoinCombination.scene_id as scene_id

        FROM Users, Experiment, CoinCombination

        WHERE
            Experiment.user_id = Users.id AND
            Experiment.coin_combination_id = CoinCombination.id AND
            Users.rating = 3 AND
            Users.id != 3

        GROUP BY CoinCombination.scene_id

        HAVING COUNT(DISTINCT Experiment.template) < 3

);
