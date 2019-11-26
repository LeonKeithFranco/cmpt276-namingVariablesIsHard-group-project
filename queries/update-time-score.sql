CREATE OR REPLACE FUNCTION update_timed_score()
    RETURNS trigger AS
$$
BEGIN
    IF NEW.timed > OLD. standard THEN
        RETURN NEW;
    ELSE
        RETURN NULL;
    END IF;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_timed_score
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_timed_score();
