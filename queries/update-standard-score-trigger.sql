CREATE OR REPLACE FUNCTION update_standard_score()
    RETURNS trigger AS
$$
BEGIN
    IF NEW.standard > OLD. standard THEN
        RETURN NEW;
    ELSE
        RETURN NULL;
    END IF;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_scores
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_standard_score();
