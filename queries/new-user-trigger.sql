CREATE OR REPLACE FUNCTION new_user()
    RETURNS trigger AS
$$
BEGIN
    UPDATE Users
    SET standard=0,
        odd_one_out=0,
        timed=0
    WHERE id=NEW.id;

    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER new_user
AFTER INSERT ON Users
FOR EACH ROW
EXECUTE PROCEDURE new_user();
