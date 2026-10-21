module.exports = {
  up: `CREATE TABLE IF NOT EXISTS user_details (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255),
    email_id VARCHAR(100),
    mobile_number VARCHAR(30),
    country_id BIGINT,
    state_id BIGINT,
    district_id BIGINT,
    zip_code VARCHAR(20),
    address VARCHAR(500),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT 0,
    updated_on TIMESTAMP NULL DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    is_deleted TINYINT NOT NULL DEFAULT 0,
    deleted_on TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT DEFAULT NULL,
    PRIMARY KEY (id)
);`,
  down: `DROP TABLE IF EXISTS user_details`,
};
