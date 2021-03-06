USE bew_db;

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES
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

INSERT INTO departments (department_name, over_head_costs) VALUES
("Apparel", 10000),
("Medicine", 21000),
("Necessities", 50000),
("Produce", 12000),
("Toiletries", 10000),
("Toys", 18000);

SELECT * FROM products;
SELECT * FROM departments;