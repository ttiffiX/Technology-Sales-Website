--Product (ProductID, Category, Price, Quantity, Name, Image)
CREATE TABLE product
(
    product_id SERIAL PRIMARY KEY,
    category   VARCHAR(20)  NOT NULL,
    price      INT          NOT NULL,
    quantity   INT          NOT NULL,
    name       VARCHAR(100) NOT NULL,
    image      varchar(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--Customer (CustomerID, Name, Email, Password, name, phone, role)
CREATE TABLE Customer
(
    customer_id SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(255),
    phone       VARCHAR(20),
    role        VARCHAR(50)  NOT NULL CHECK (role IN ('Admin', 'Customer')),
);

INSERT INTO customer (username, email, password, name, role)
VALUES ('ttiffX', 'sangpham1224@gmail.com', '123456', 'Sang', 'Customer')

--Order (OrderID, CustomerID, order_date, update_at, total_price, Status, name, phone, address)
CREATE TABLE orders
(
    order_id    SERIAL PRIMARY KEY,
    customer_id INT         NOT NULL,
    order_date  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    update_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    total_price INT         NOT NULL,
    status      VARCHAR(20) DEFAULT 'Pending', --pending, successed, canceled
    name        VARCHAR(255),
    phone       VARCHAR(20) NOT NULL,
    address     TEXT        NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer (customer_id) ON DELETE CASCADE
);


--OrderDetail (orderdetail_id,OrderID, ProductID, Quantity, unit_price)
CREATE TABLE OrderDetail
(
    orderdetail_id SERIAL PRIMARY KEY,
    order_id       INT NOT NULL,
    product_id     INT NOT NULL,
    quantity       INT NOT NULL,
    unit_price     INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product (product_id) ON DELETE CASCADE
);

--CART(cart_id, customer_id,product_id,quantity,update_at)
CREATE TABLE Cart
(
    cart_id     SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    update_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer (customer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product (product_id) ON DELETE CASCADE
);

--payment(payment_id, order_id, payment_method, status, update_at)
CREATE TABLE payment
(
    payment_id     SERIAL PRIMARY KEY,
    order_id       INT NOT NULL,
    payment_method  VARCHAR(20), --card, cash
    status  VARCHAR(20) DEFAULT 'Pending', --pending, paid, canceled
    update_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
);

--Product (ProductID, Category, Price, Quantity, Name)
INSERT INTO Product (Category, Price, Quantity, Name)
VALUES ('Laptop', 20490000, 50, 'Laptop ASUS TUF Gaming F15 FX507ZC4-HN095W'),
       ('Laptop', 20990000, 50, 'Laptop Lenovo LOQ 15ARP9 83JC007HVN'),
       ('Laptop', 16390000, 0, 'Laptop Dell Inspiron 15 3520'),
       ('Mouse', 745000, 20, 'Logitech G304 Lightspeed'),
       ('Keyboard', 1199000, 0, 'E-DRA-EK375-Alpha'),
       ('Keyboard', 490000, 30, 'AULA-F75');

UPDATE product
SET image = CASE
                WHEN product_id = 1 THEN 'Lap1-ASUS-TUF-F15.png'
                WHEN product_id = 2 THEN 'Lap2-Lenovo-LOQ.png'
                WHEN product_id = 3 THEN 'Lap3-DELL-inspiron-15.png'
                WHEN product_id = 4 THEN 'Mouse4-Logitech-G304.png'
                WHEN product_id = 5 THEN 'Keyboard5-E-DRA-EK375.png'
                WHEN product_id = 6 THEN 'Keyboard6-AULA-F75.png'
                ELSE image -- Giữ nguyên giá trị cũ nếu không khớp
    END
WHERE product_id IN (1, 2, 3, 4, 5, 6);




