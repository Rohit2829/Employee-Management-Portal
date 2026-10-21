module.exports = {
    up: `CREATE TABLE IF NOT EXISTS role_privileges_mapping (
      id BIGINT NOT NULL AUTO_INCREMENT,
      role_id BIGINT NOT NULL,
      privilege_id BIGINT NOT NULL,
      created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by BIGINT DEFAULT NULL,
      updated_on TIMESTAMP NULL DEFAULT NULL,
      updated_by BIGINT DEFAULT NULL,
      is_deleted TINYINT NOT NULL DEFAULT 0,
      deleted_on TIMESTAMP NULL DEFAULT NULL,
      deleted_by BIGINT DEFAULT NULL,
      PRIMARY KEY (id)
  );`,
  
    down: `DROP TABLE IF EXISTS role_privileges_mapping`,
  };
  