DROP DATABASE IF EXISTS bew_db;
CREATE DATABASE bew_db;
USE bew_db;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(35) NOT NULL,
    deparment_name VARCHAR(15),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, deparment_name, price, stock_quantity) VALUES
("The Meaning of Life", "Necessities", 42, 0),
("Fluffy Towel", "Toiletries", 9.99, 5453),
("BEW T-Shirt", "Apparel", 19.99, 45312),
("Teddy Bear (18 in.)", "Toys", 14.99, 4823),
("Banana", "Produce", .50, 435),
("Crabapple", "Produce", .10, 844),
("Rhinestoned Jeans with Sylish Tears", "Apparel", 89.99, 213),
("Triple Pronged Electic Toothbrush", "Toiletries", 249.99, 93),
("Neon Windbreaker", "Apparel", 19.80, 1990),
("Teddy Bear (71 in.)", "Toys", 79.99, 938),
("Bobbydryl Anti-Allergy Supplement", "Medicine", 18.99, 729);

SELECT * FROM products;