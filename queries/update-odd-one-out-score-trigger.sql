CREATE OR REPLACE FUNCTION update_odd_one_out_score()
    RETURNS trigger AS
$$
BEGIN
    IF NEW.odd_one_out > OLD. standard THEN
        RETURN NEW;
    ELSE
        RETURN NULL;
    END IF;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_odd_one_out_scores
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_odd_one_out_score();
