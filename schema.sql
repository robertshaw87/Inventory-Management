DROP DATABASE IF EXISTS bew_db;
CREATE DATABASE bew_db;
USE bew_db;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(35) NOT NULL,
    department_name VARCHAR(15),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales DECIMAL(20,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id)
);

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(15) NOT NULL,
    over_head_costs DECIMAL(20,2) NOT NULL,
    PRIMARY KEY (department_id)
);

SELECT * FROM products;
SELECT * FROM departments;