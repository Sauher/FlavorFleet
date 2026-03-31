ALTER TABLE restaurants
ADD CONSTRAINT fk_restaurants_owner_id
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
