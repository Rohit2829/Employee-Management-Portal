module.exports = {
  up: `CREATE TABLE IF NOT EXISTS user_master (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_type SMALLINT,
    role_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_id VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(100) NOT NULL,
    password VARCHAR(200) NOT NULL,
    previous_password VARCHAR(200),
    is_master SMALLINT NOT NULL DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT 0,
    updated_on TIMESTAMP NULL DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    is_deleted TINYINT NOT NULL DEFAULT 0,
    deleted_on TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT DEFAULT NULL,
    PRIMARY KEY (id)
);`,
  down: `DROP TABLE IF EXISTS user_master`,
};
