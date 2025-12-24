-- Enums
drop type user_role_enum;
CREATE TYPE user_role_enum AS ENUM (
    'ADMIN',
    'USER',
    'PM'
    );
drop type order_status_enum;
CREATE TYPE order_status_enum AS ENUM (
    'PENDING', -- Chờ PM duyệt (đã thanh toán hoặc chọn COD)
    'APPROVED', -- PM đã đồng ý và đang chuẩn bị hàng
    'SHIPPING', -- Đang giao hàng (nên thêm trạng thái này)
    'REJECTED', -- PM từ chối đơn
    'CANCELLED', -- User hủy
    'COMPLETED' -- Giao hàng thành công
    );

drop type payment_status_enum cascade;
CREATE TYPE payment_status_enum AS ENUM (
    'PENDING', --Đang chờ thanh toán
    'PAID', --Đã thanh toán
    'FAILED', --Thanh toán thất bại
    'REFUND' --Đã hoàn tiền
    );

-- drop type order_payment_method_enum;
-- CREATE TYPE order_payment_method_enum AS ENUM (
--     'CASH',
--     'VNPAY'
--     );

--------------------------
-- BẢNG CHÍNH (MASTER TABLES)
--------------------------

-- 1. Bảng User
drop table users;
CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(50) UNIQUE NOT NULL,
    username   VARCHAR(50) UNIQUE NOT NULL,
    password   VARCHAR(255)       NOT NULL,
    phone      VARCHAR(11),
    role       user_role_enum     NOT NULL,
    name       VARCHAR(50),
    is_active  BOOLEAN,
    created_at DATE,
    image_url  VARCHAR(255)
);

-- 2. Bảng Categories
drop table categories;
CREATE TABLE categories
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- 3. Bảng ProductAttributes
drop table product_attributes;
CREATE TABLE product_attributes
(
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(50) NOT NULL,
    unit      VARCHAR(20),
    data_type VARCHAR(20)
);

-- 4. Bảng Product
drop table product;
CREATE TABLE product
(
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   VARCHAR(5000),
    price         INT          NOT NULL,
    quantity_sold INT,
    quantity      INT,
    category_id   INT,
    image_url     VARCHAR(255),
    is_active     BOOLEAN,
    created_at    TIMESTAMP,
    -- Khóa ngoại đến Categories
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

--------------------------
-- BẢNG QUAN HỆ (RELATIONSHIP TABLES)
--------------------------

-- 5. Bảng CategoryAttributeMapping (Liên kết Categories với ProductAttributes)
drop table category_attribute_mapping;
CREATE TABLE category_attribute_mapping
(
    id            SERIAL PRIMARY KEY,
    category_id   INT,
    attribute_id  INT,
    is_filterable BOOLEAN,
    -- Khóa ngoại đến Categories
    CONSTRAINT fk_cam_category FOREIGN KEY (category_id) REFERENCES categories (id),
    -- Khóa ngoại đến ProductAttributes
    CONSTRAINT fk_cam_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes (id),
    -- Đảm bảo mỗi thuộc tính chỉ được map một lần trong một Category
    UNIQUE (category_id, attribute_id)
);

-- 6. Bảng ProductAttributeValues (Lưu giá trị thuộc tính cho từng Product)
drop table product_attribute_values;
CREATE TABLE product_attribute_values
(
    id           SERIAL PRIMARY KEY,
    product_id   INT,
    attribute_id INT,
    value        VARCHAR(255),
    -- Khóa ngoại đến Product
    CONSTRAINT fk_pav_product FOREIGN KEY (product_id) REFERENCES product (id),
    -- Khóa ngoại đến ProductAttributes
    CONSTRAINT fk_pav_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes (id),
    -- Mỗi thuộc tính chỉ có một giá trị cho mỗi sản phẩm
    UNIQUE (product_id, attribute_id)
);

--------------------------
-- BẢNG GIAO DỊCH (TRANSACTION TABLES)
--------------------------

-- 7. Bảng Order
drop table orders;
CREATE TABLE orders
(
    id             SERIAL PRIMARY KEY,
    user_id        INT,
    customer_name  VARCHAR(50),
    phone          VARCHAR(50),
    email          VARCHAR(50),
    address        TEXT,
    province       VARCHAR(20),
    delivery_fee   INT,
    total_price    INT,
    created_at     DATE,
    updated_at     DATE,
    status         order_status_enum,
    description    TEXT,
--     payment_method order_payment_method_enum,
    payment_method VARCHAR(20), -- 'CASH', 'VNPAY'
    -- Khóa ngoại đến User
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 8. Bảng OrderDetail
drop table order_detail;
CREATE TABLE order_detail
(
    id            SERIAL PRIMARY KEY,
    order_id      INT,
    product_id    INT,
    product_title VARCHAR(255) NOT NULL,
    category_name VARCHAR(100),
    quantity      INT          NOT NULL,
    price         INT          NOT NULL,
    -- Khóa ngoại đến Order
    CONSTRAINT fk_od_order FOREIGN KEY (order_id) REFERENCES orders (id),
    -- Khóa ngoại đến Product
    CONSTRAINT fk_od_product FOREIGN KEY (product_id) REFERENCES product (id)
);

-- 9. Bảng Invoice
DROP table invoice;
CREATE TABLE invoice
(
    id             SERIAL PRIMARY KEY,
    order_id       INT UNIQUE NOT NULL, -- UNIQUE vì mỗi Order chỉ có 1 Invoice
    transaction_id VARCHAR(255),
    status         payment_status_enum,
    created_at     DATE,
    updated_at     DATE,
    exipires_at     DATE,
    content        TEXT,
    amount         INT        NOT NULL,
    provider       VARCHAR(20),         -- 'VNPAY', 'PAYOS'
    raw_response   JSONB,
    -- Khóa ngoại đến Order
    CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- 10. Bảng Cart
drop table cart;
CREATE TABLE cart
(
    id         SERIAL PRIMARY KEY,
    user_id    INT UNIQUE NOT NULL, -- UNIQUE vì mỗi User chỉ có 1 Cart
    updated_at DATE,
    -- Khóa ngoại đến User
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 11. Bảng CartDetail
drop table cart_detail;
CREATE TABLE cart_detail
(
    id          SERIAL PRIMARY KEY,
    cart_id     INT,
    product_id  INT,
    quantity    INT NOT NULL,
    is_selected BOOLEAN DEFAULT TRUE,
    added_at    DATE,
    -- Khóa ngoại đến Cart
    CONSTRAINT fk_cd_cart FOREIGN KEY (cart_id) REFERENCES cart (id),
    -- Khóa ngoại đến Product
    CONSTRAINT fk_cd_product FOREIGN KEY (product_id) REFERENCES product (id),
    -- Mỗi sản phẩm chỉ có một dòng trong một Cart
    UNIQUE (cart_id, product_id)
);


-- DATA
INSERT INTO categories (name)
VALUES ('Máy tính xách tay'),
       ('Điện thoại di động'),
       ('Phụ kiện');

INSERT INTO product_attributes (name, unit, data_type)
VALUES ('RAM', 'GB', 'Số nguyên'),
       ('Bộ nhớ trong', 'GB', 'Số nguyên'),
       ('Kích thước màn hình', 'inch', 'Số thực'),
       ('Độ phân giải', 'pixels', 'Văn bản'),
       ('Cổng kết nối', NULL, 'Văn bản'),
       ('Loại bàn phím', NULL, 'Văn bản'),
       ('Tốc độ phản hồi', 'ms', 'Số nguyên');

-- Máy tính xách tay (ID=1)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
VALUES (1, 1, TRUE),  -- RAM
       (1, 2, FALSE), -- Bộ nhớ trong (SSD)
       (1, 3, TRUE),  -- Kích thước màn hình
       (1, 5, FALSE);
-- Cổng kết nối

-- Điện thoại di động (ID=2)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
VALUES (2, 1, TRUE), -- RAM
       (2, 2, TRUE), -- Bộ nhớ trong (ROM)
       (2, 4, FALSE);
-- Độ phân giải

-- Phụ kiện (ID=3) - Ví dụ: Bàn phím
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
VALUES (3, 6, TRUE), -- Loại bàn phím
       (3, 7, FALSE);
-- Tốc độ phản hồi

-- Sản phẩm 1: Máy tính xách tay (Category ID: 1)
INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
VALUES ('Laptop Gaming XYZ', 'Máy tính xách tay hiệu năng cao cho game thủ.', 25000000, 50, 1, TRUE, NOW());

-- Sản phẩm 2: Điện thoại di động (Category ID: 2)
INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
VALUES ('Smartphone Flagship Alpha', 'Điện thoại cao cấp với camera siêu nét.', 18000000, 120, 2, TRUE, NOW());

-- Sản phẩm 3: Phụ kiện (Category ID: 3)
INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
VALUES ('Bàn phím cơ Blue Switch', 'Bàn phím cơ chất lượng cao, gõ êm.', 1500000, 200, 3, TRUE, NOW());

-- Sản phẩm 4: Phụ kiện (Category ID: 3)
INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
VALUES ('Chuột quang không dây M900', 'Chuột thiết kế công thái học, pin lâu.', 450000, 300, 3, TRUE, NOW());

-- Thuộc tính cho Laptop Gaming XYZ (Product ID: 1)
INSERT INTO product_attribute_values (product_id, attribute_id, value)
VALUES (1, 1, '16'),  -- RAM 16GB
       (1, 2, '512'), -- Bộ nhớ trong 512GB
       (1, 3, '15.6');
-- Kích thước màn hình 15.6 inch

-- Thuộc tính cho Smartphone Flagship Alpha (Product ID: 2)
INSERT INTO product_attribute_values (product_id, attribute_id, value)
VALUES (2, 1, '12'),  -- RAM 12GB
       (2, 2, '256'), -- Bộ nhớ trong 256GB
       (2, 4, '1440x3200');
-- Độ phân giải

-- Thuộc tính cho Bàn phím cơ Blue Switch (Product ID: 3)
INSERT INTO product_attribute_values (product_id, attribute_id, value)
VALUES (3, 6, 'Blue Switch'), -- Loại bàn phím
       (3, 7, '1'); -- Tốc độ phản hồi 1ms