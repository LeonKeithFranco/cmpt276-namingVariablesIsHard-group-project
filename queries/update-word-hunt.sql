BEGIN;

ALTER TABLE Users
ADD COLUMN word_hunt INT DEFAULT 0;

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

    IF NEW.word_hunt < OLD.word_hunt THEN
        NEW.word_hunt = OLD.word_hunt;
    END IF;

    RETURN NEW;
END
$$
LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_scores ON Users;

CREATE TRIGGER update_scores
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_scores();

COMMIT;
