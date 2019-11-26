CREATE OR REPLACE FUNCTION new_user()
    RETURNS trigger AS
$$
BEGIN
    NEW.standard=0;
    NEW.odd_one_out=0;
    NEW.timed=0;

    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER new_user
BEFORE INSERT ON Users
FOR EACH ROW
EXECUTE PROCEDURE new_user();
