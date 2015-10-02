-- Checks that each user has never twice either the same scene or the same recommendation style
SELECT count(*) = 0
FROM
    Experiment as E1,
    Experiment as E2,
    CoinCombination as C1,
    CoinCombination as C2

WHERE
        E1.user_id = E2.user_id
    AND E1.id != E2.id
    AND E1.coin_combination_id = C1.id
    AND E2.coin_combination_id = C2.id
    AND (E1.recommendation_style = E2.recommendation_style OR C1.scene_id = C2.scene_id);

-- Checks that a CoinCombination is never used more than 3 times (except for the tutorial)
SELECT count(*) = 0
FROM (
    SELECT count(CoinCombination.id)
    FROM Experiment, CoinCombination
    WHERE Experiment.coin_combination_id = CoinCombination.id AND scene_id != 1
    GROUP BY Experiment.coin_combination_id
    HAVING count(CoinCombination.id) > 3
) AS T;

-- Checks that the CoinCombination for a tutorial is only used once
SELECT count(*) = 0
FROM (
    SELECT count(CoinCombination.id)
    FROM Experiment, CoinCombination
    WHERE Experiment.coin_combination_id = CoinCombination.id AND scene_id = 1
    GROUP BY Experiment.coin_combination_id
    HAVING count(CoinCombination.id) != 1
) AS T;
