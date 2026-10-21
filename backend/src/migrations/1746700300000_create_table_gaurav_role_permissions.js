module.exports = {
  up: `CREATE TABLE IF NOT EXISTS gaurav_role_permissions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES gaurav_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES gaurav_permissions(id) ON DELETE CASCADE
);`,

  down: `DROP TABLE IF EXISTS gaurav_role_permissions`,
};
