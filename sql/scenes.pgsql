#!/bin/bash

psql interface 3dinterface << E_O_SQL

ALTER TABLE Scene ADD recommendation_number INTEGER;

UPDATE SCENE SET recommendation_number = 11 WHERE id = 2;
UPDATE SCENE SET recommendation_number = 11 WHERE id = 3;
UPDATE SCENE SET recommendation_number = 10 WHERE id = 4;

E_O_SQL
