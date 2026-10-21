module.exports = {
    up: `CREATE TABLE IF NOT EXISTS menuhierarchy (
      id BIGINT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255),
      disp_name VARCHAR(255),
      parent_id INT,
      entity_url VARCHAR(255) NOT NULL,
      description VARCHAR(1000),
      is_active SMALLINT NOT NULL,
      org_id INT NOT NULL,
      icon_name VARCHAR(100),
      display_order INT,
      created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by BIGINT DEFAULT NULL,
      updated_on TIMESTAMP NULL DEFAULT NULL,
      updated_by BIGINT DEFAULT NULL,
      is_deleted TINYINT NOT NULL DEFAULT 0,
      deleted_on TIMESTAMP NULL DEFAULT NULL,
      deleted_by BIGINT DEFAULT NULL,
      PRIMARY KEY (id)
  );`,
  
    down: `DROP TABLE IF EXISTS menuhierarchy`,
  };
  