DELETE FROM arrowclicked        WHERE exp_id > 1;
DELETE FROM coinclicked         WHERE exp_id > 1;
DELETE FROM keyboardevent       WHERE exp_id > 1;
DELETE FROM resetclicked        WHERE exp_id > 1;
DELETE FROM previousnextclicked WHERE exp_id > 1;
DELETE FROM hovered             WHERE exp_id > 1;
DELETE FROM experiment          WHERE id     > 1;
DELETE FROM users               WHERE id     > 1;
