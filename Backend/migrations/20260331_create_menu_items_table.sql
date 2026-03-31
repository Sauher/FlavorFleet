CREATE TABLE IF NOT EXISTS menu_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  restaurant_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price INT NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  imageURL VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
