module.exports = {
    up: `CREATE TABLE IF NOT EXISTS state (
      id BIGINT NOT NULL AUTO_INCREMENT,
      country_id BIGINT NOT NULL,
      state_code VARCHAR(20),
      name VARCHAR(255),
      created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by BIGINT DEFAULT NULL,
      updated_on TIMESTAMP NULL DEFAULT NULL,
      updated_by BIGINT DEFAULT NULL,
      is_deleted TINYINT NOT NULL DEFAULT 0,
      deleted_on TIMESTAMP NULL DEFAULT NULL,
      deleted_by BIGINT DEFAULT NULL,
      PRIMARY KEY (id)
  );`,
  
    down: `DROP TABLE IF EXISTS state`,
  };
  