INSERT INTO users(name) VALUES('Thomas');
INSERT INTO keyboardevent(user_id, direction, camera) VALUES(
    1,
    NULL,
    ROW(ROW(0,0,0), ROW(0,0,0))
);

SELECT ((camera).position).x FROM keyboardevent;
