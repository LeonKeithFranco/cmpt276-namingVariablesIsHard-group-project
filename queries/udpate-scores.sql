CREATE OR REPLACE FUNCTION update_scores()
    RETURNS trigger AS
$$
BEGIN
    IF NEW.standard < OLD.standard THEN
        NEW.standard = OLD.standard;
    END IF;

    IF NEW.odd_one_out < OLD.odd_one_out THEN
        NEW.odd_one_out = OLD.odd_one_out;
    END IF;

    IF NEW.timed < OLD.timed THEN
        NEW.timed = OLD.timed;
    END IF;

    RETURN NEW;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_scores
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_scores();
