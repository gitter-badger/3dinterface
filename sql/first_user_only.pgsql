DELETE FROM arrowclicked        WHERE user_id > 1;
DELETE FROM coinclicked         WHERE user_id > 1;
DELETE FROM keyboardevent       WHERE user_id > 1;
DELETE FROM resetclicked        WHERE user_id > 1;
DELETE FROM previousnextclicked WHERE user_id > 1;
DELETE FROM hovered             WHERE user_id > 1;
DELETE FROM users               WHERE id      > 1;
