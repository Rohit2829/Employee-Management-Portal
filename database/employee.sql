-- ============================================================
-- Employee CRUD Database Setup for MySQL Workbench
-- Run this entire script in MySQL Workbench to create the
-- database, table, and seed some sample data.
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS `hzl_employee_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hzl_employee_db`;

-- 2. Create the employees table
CREATE TABLE IF NOT EXISTS `employees` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT,
  `emp_id` VARCHAR(50)  NOT NULL,
  `first_name`   VARCHAR(100)  NOT NULL,
  `last_name`    VARCHAR(100)  NOT NULL,
  `email`        VARCHAR(255)  NOT NULL,
  `phone`        VARCHAR(20)   DEFAULT NULL,
  `department`   VARCHAR(100)  DEFAULT NULL,
  `designation`  VARCHAR(100)  DEFAULT NULL,
  `salary`       DECIMAL(12,2) DEFAULT 0.00,
  `joining_date` DATE          DEFAULT NULL,
  `status`       TINYINT       NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `created_on`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by`   BIGINT        DEFAULT NULL,
  `updated_on`   DATETIME      DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by`   BIGINT        DEFAULT NULL,
  `is_deleted`   TINYINT       NOT NULL DEFAULT 0 COMMENT '0 = Not Deleted, 1 = Deleted',
  `deleted_on`   DATETIME      DEFAULT NULL,
  `deleted_by`   BIGINT        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_emp_id` (`emp_id`),
  UNIQUE KEY `uq_employee_email` (`email`),
  UNIQUE KEY `uq_employee_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed sample data 
INSERT INTO `employees` (`emp_id`, `first_name`, `last_name`, `email`, `phone`, `department`, `designation`, `salary`, `joining_date`, `status`) VALUES
('EMP-001', 'Rohit',    'Yadav',    'rohit.yadav@hzl.com',    '9876543210', 'Engineering',  'Software Engineer',    75000.00, '2024-01-15', 1),
('EMP-002', 'Priya',    'Sharma',   'priya.sharma@hzl.com',   '9876543211', 'HR',           'HR Manager',           65000.00, '2023-06-01', 1),
('EMP-003', 'Amit',     'Verma',    'amit.verma@hzl.com',     '9876543212', 'Finance',      'Financial Analyst',    60000.00, '2023-09-20', 1),
('EMP-004', 'Neha',     'Gupta',    'neha.gupta@hzl.com',     '9876543213', 'Marketing',    'Marketing Lead',       70000.00, '2024-03-10', 1),
('EMP-005', 'Vikram',   'Singh',    'vikram.singh@hzl.com',   '9876543214', 'Engineering',  'Senior Developer',     90000.00, '2022-11-05', 1);
