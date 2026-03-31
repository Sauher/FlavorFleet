CREATE TABLE IF NOT EXISTS restaurants (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  address VARCHAR(255) NOT NULL,
  image_url VARCHAR(512) NULL,
  phone VARCHAR(20) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_open TINYINT(1) NOT NULL DEFAULT 0,
  opening_hours JSON NOT NULL,
  images JSON NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
