SELECT user_id, arrow_id as elt_id, time, 'arrow' as elt FROM arrowclicked
UNION
SELECT user_id, coin_id, time, 'coin' FROM coinclicked
ORDER BY time;
