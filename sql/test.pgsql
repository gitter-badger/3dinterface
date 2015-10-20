#! /bin/sh

psql interface 3dinterface << E_O_SQL

SELECT * FROM (
    SELECT Users.id AS user_id,
           Experiment.id AS exp_id,
           Scene.name AS scene_name,
           Scene.recommendation_number AS reco_total,
           count(DISTINCT ArrowClicked.arrow_id) AS reco_clicked,
           -- Scene.recommendation_number - 2 <= count(DISTINCT ArrowClicked.arrow_id) AS reco_clicker
           100 * count(DISTINCT ArrowClicked.arrow_id) / Scene.recommendation_number AS reco_percent

    FROM Users, Experiment, CoinCombination, ArrowClicked, Scene
    -- JOIN conditions
    WHERE Experiment.user_id = Users.id AND
          CoinCombination.id = Experiment.coin_combination_id AND
          ArrowClicked.exp_id = Experiment.id AND
          Scene.id = CoinCombination.scene_id AND

    -- other conditions
          Experiment.finished AND
          CoinCombination.scene_id != 1 AND
          Users.valid

    GROUP BY Users.id, Experiment.id, Scene.name, Scene.recommendation_number
) T
WHERE reco_percent > 75
ORDER BY reco_percent

;

E_O_SQL
