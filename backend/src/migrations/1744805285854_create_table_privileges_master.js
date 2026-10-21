module.exports = {
    up: `CREATE TABLE IF NOT EXISTS privileges_master (
      id BIGINT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255),
      privilege_unique_id VARCHAR(255),
      menu_id INT,
      created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by BIGINT DEFAULT NULL,
      updated_on TIMESTAMP NULL DEFAULT NULL,
      updated_by BIGINT DEFAULT NULL,
      is_deleted TINYINT NOT NULL DEFAULT 0,
      deleted_on TIMESTAMP NULL DEFAULT NULL,
      deleted_by BIGINT DEFAULT NULL,
      PRIMARY KEY (id)
  );`,
  
    down: `DROP TABLE IF EXISTS privileges_master`,
  };
  