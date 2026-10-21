module.exports = {
  up: `CREATE TABLE IF NOT EXISTS categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id BIGINT DEFAULT NULL,
    image_url VARCHAR(500),
    is_active TINYINT NOT NULL DEFAULT 1,
    display_order INT DEFAULT 0,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT NOT NULL DEFAULT 0,
    deleted_on TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);`,

  down: `DROP TABLE IF EXISTS categories`,
};
