-- Tăng tốc lọc sản phẩm theo danh mục
CREATE INDEX idx_product_category ON product (category_id);

-- Tăng tốc tìm kiếm theo tên sản phẩm (Cơ bản)
CREATE INDEX idx_product_title ON product (title);

-- Tăng tốc lọc theo khoảng giá (WHERE price BETWEEN x AND y)
CREATE INDEX idx_product_price ON product (price);

-- Tăng tốc sắp xếp sản phẩm mới nhất (ORDER BY created_at DESC)
CREATE INDEX idx_product_created_at ON product (created_at DESC);

-- Giúp lấy nhanh danh sách thuộc tính của 1 sản phẩm cụ thể
CREATE INDEX idx_pav_product_id ON product_attribute_values (product_id);

-- Giúp lọc sản phẩm theo thuộc tính (VD: Tìm tất cả sản phẩm có Màu = Đỏ)
CREATE INDEX idx_pav_attr_value ON product_attribute_values (attribute_id, value);

-- Giúp User xem lịch sử mua hàng nhanh hơn
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Giúp Admin/PM lọc đơn hàng theo trạng thái (VD: Lấy đơn PENDING để duyệt)
CREATE INDEX idx_orders_status ON orders (status);

-- Tối ưu hóa khi JOIN bảng Order và OrderDetail
CREATE INDEX idx_order_detail_order_id ON order_detail (order_id);

-- Tối ưu hóa khi load giỏ hàng (JOIN Cart và CartDetail)
CREATE INDEX idx_cart_detail_cart_id ON cart_detail (cart_id);

-- Tối ưu hóa tìm kiếm token xác thực email
CREATE INDEX idx_evt_token ON email_verification_tokens (token);

-- Tối ưu load danh sách địa chỉ của User
CREATE INDEX idx_user_address_user_id ON user_address (user_id);

-- Tìm kiếm hóa đơn theo mã giao dịch (của VNPAY/PayOS trả về)
CREATE INDEX idx_invoice_transaction_id ON invoice (transaction_id);

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
    'REFUND', --Đã hoàn tiền
    'REFUND_FAILED' --Hoàn tiền thất bại
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
    CONSTRAINT fk_pav_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes (id)
    -- NOTE: Removed UNIQUE constraint to allow multiple values for same attribute
    -- This enables filtering for multi-value attributes (e.g., "Kiểu kết nối": Bluetooth, USB, etc.)
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
    exipires_at    DATE,
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

drop table email_verification_tokens;
CREATE TABLE email_verification_tokens
(
    id          SERIAL PRIMARY KEY,
    user_id     INT UNIQUE   NOT NULL,
    token       VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP    NOT NULL,
    is_used     BOOLEAN DEFAULT FALSE,
    last_sent   TIMESTAMP    NOT NULL,
    -- Khóa ngoại đến User
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users (id)
);

drop table user_address;
CREATE TABLE user_address
(
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL,
    province_code VARCHAR(20),
    ward_code     VARCHAR(20),
    address       TEXT,
    -- Cờ đánh dấu
    is_default    BOOLEAN DEFAULT FALSE, -- Địa chỉ mặc định để ship hàng
    label         VARCHAR(20),           -- Ví dụ: "Nhà riêng", "Công ty"
    CONSTRAINT fk_user_address FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

drop table refresh_tokens;
CREATE TABLE refresh_tokens
(
    id         SERIAL PRIMARY KEY,
    user_id    INT UNIQUE   NOT NULL,
    token      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    expiry_at TIMESTAMP    NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    -- Khóa ngoại đến User
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


-- DATA
INSERT INTO categories (name)
VALUES ('Máy tính xách tay'),
       ('Điện thoại di động'),
       ('Bàn Phím'),
       ('Chuột'),
       ('Tai nghe');

-- INSERT INTO product_attributes (name, unit, data_type)
-- VALUES ('RAM', 'GB', 'Số nguyên'),
--        ('Bộ nhớ trong', 'GB', 'Số nguyên'),
--        ('Kích thước màn hình', 'inch', 'Số thực'),
--        ('Độ phân giải', 'pixels', 'Văn bản'),
--        ('Cổng kết nối', NULL, 'Văn bản'),
--        ('Loại bàn phím', NULL, 'Văn bản'),
--        ('Tốc độ phản hồi', 'ms', 'Số nguyên');

INSERT INTO product_attributes (name, unit, data_type)
VALUES
-- Nhóm Vi xử lý & Đồ họa
('Công nghệ CPU', NULL, 'Text'),              -- ví dụ Intel Core i7
('Tên đầy đủ CPU', NULL, 'Text'),             -- ví dụ Intel Core i7-13420H
('Số nhân/Số luồng', NULL, 'Text'),
('Card đồ họa (onboard)', NULL, 'Text'),      --ví dụ Intel UHD Graphics
('Card đồ họa (rời)', NULL, 'Text'),          --ví dụ NVIDIA RTX 3050 4GB
-- Nhóm Bộ nhớ & Lưu trữ
('Dung lượng RAM', 'GB', 'Number'),
('Dung lượng SSD', 'GB', 'Number'),
('Dung lượng ROM', 'GB', 'Number'),
-- Nhóm Màn hình
('Kích thước màn hình', 'inch', 'Number'),
('Độ phân giải', NULL, 'Text'),
('Tần số quét', 'Hz', 'Number'),
-- Nhóm khác
('Trọng lượng', 'kg', 'Number'),
('Hệ điều hành', NULL, 'Text'),               -- ví dụ Windows, macOS, iOS, Android (không thêm dạng ios 17 hay android 14)
('Dung lượng Pin', NULL, 'Text'),
-- Nhóm Phụ kiện (đặc thù)
('Kiểu kết nối', NULL, 'Text'),               --bluetooth, usb, type-c, lightning, jack 3.5mm
('Loại Switch', NULL, 'Text'),
('LED', NULL, 'Text'),                        -- Có hoặc không
('DPI', NULL, 'Text'),
('Loại sản phẩm', NULL,
 'Text'),                                     -- có dây, không dây (chuột); có dây, không dây, cơ(bàn phím); in-ear, on-ear, Earbubs, over-ear (cho tai nghe)
('Thời gian sử dụng pin', 'hours', 'Number'), -- cho tai nghe, bàn phím không dây hoặc chuốt không dây(nếu có)
('Tính năng', NULL, 'Text');
-- chống ồn, chống nước, rung, cảm ứng đa điểm, xoay 360 độ

-- Laptop (Category 1)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
SELECT 1, id, TRUE
FROM product_attributes
WHERE name IN
      ('Công nghệ CPU', 'Tên đầy đủ CPU', 'Số nhân/Số luồng', 'Card đồ họa (onboard)', 'Card đồ họa (rời)',
       'Dung lượng RAM',
       'Dung lượng SSD',
       'Kích thước màn hình',
       'Tần số quét', 'Độ phân giải', 'Trọng lượng', 'Hệ điều hành', 'Dung lượng Pin');

-- Điện thoại (Category 2 - Theo thông số bạn gửi thực chất là Laptop văn phòng, nhưng tôi sẽ map theo kiểu Smartphone phổ thông)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
SELECT 2, id, TRUE
FROM product_attributes
WHERE name IN
      ('Công nghệ CPU', 'Tên đầy đủ CPU', 'Dung lượng RAM', 'Dung lượng ROM', 'Kích thước màn hình', 'Độ phân giải',
       'Tần số quét',
       'Trọng lượng', 'Hệ điều hành', 'Dung lượng Pin');

-- Bàn phím (Category 3)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
SELECT 3, id, TRUE
FROM product_attributes
WHERE name IN ('Trọng lượng', 'Kiểu kết nối', 'Loại Switch', 'LED', 'Loại sản phẩm', 'Thời gian sử dụng pin');

-- chuột (Category 4)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
SELECT 4, id, TRUE
FROM product_attributes
WHERE name IN ('Trọng lượng', 'Kiểu kết nối', 'DPI', 'LED', 'Loại sản phẩm', 'Thời gian sử dụng pin', 'Tính năng');

-- tai nghe (Category 5)
INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
SELECT 5, id, TRUE
FROM product_attributes
WHERE name IN ('Trọng lượng', 'Kiểu kết nối', 'Loại sản phẩm', 'Thời gian sử dụng pin', 'Tính năng');

-- -- Máy tính xách tay (ID=1)
-- INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
-- VALUES (1, 1, TRUE),  -- RAM
--        (1, 2, FALSE), -- Bộ nhớ trong (SSD)
--        (1, 3, TRUE),  -- Kích thước màn hình
--        (1, 5, FALSE); -- Cổng kết nối
--
-- -- Điện thoại di động (ID=2)
-- INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
-- VALUES (2, 1, TRUE), -- RAM
--        (2, 2, TRUE), -- Bộ nhớ trong (ROM)
--        (2, 4, FALSE); -- Độ phân giải
--
-- -- Phụ kiện (ID=3) - Ví dụ: Bàn phím
-- INSERT INTO category_attribute_mapping (category_id, attribute_id, is_filterable)
-- VALUES (3, 6, TRUE), -- Loại bàn phím
--        (3, 7, FALSE);-- Tốc độ phản hồi


-- -- Sản phẩm 1: Máy tính xách tay (Category ID: 1)
-- INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
-- VALUES ('Laptop Gaming XYZ', 'Máy tính xách tay hiệu năng cao cho game thủ.', 25000000, 50, 1, TRUE, NOW());
--
-- -- Sản phẩm 2: Điện thoại di động (Category ID: 2)
-- INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
-- VALUES ('Smartphone Flagship Alpha', 'Điện thoại cao cấp với camera siêu nét.', 18000000, 120, 2, TRUE, NOW());
--
-- -- Sản phẩm 3: Phụ kiện (Category ID: 3)
-- INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
-- VALUES ('Bàn phím cơ Blue Switch', 'Bàn phím cơ chất lượng cao, gõ êm.', 1500000, 200, 3, TRUE, NOW());
--
-- -- Sản phẩm 4: Phụ kiện (Category ID: 3)
-- INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at)
-- VALUES ('Chuột quang không dây M900', 'Chuột thiết kế công thái học, pin lâu.', 450000, 300, 3, TRUE, NOW());
--
-- -- Thuộc tính cho Laptop Gaming XYZ (Product ID: 1)
-- INSERT INTO product_attribute_values (product_id, attribute_id, value)
-- VALUES (1, 1, '16'),  -- RAM 16GB
--        (1, 2, '512'), -- Bộ nhớ trong 512GB
--        (1, 3, '15.6');
-- -- Kích thước màn hình 15.6 inch
--
-- -- Thuộc tính cho Smartphone Flagship Alpha (Product ID: 2)
-- INSERT INTO product_attribute_values (product_id, attribute_id, value)
-- VALUES (2, 1, '12'),  -- RAM 12GB
--        (2, 2, '256'), -- Bộ nhớ trong 256GB
--        (2, 4, '1440x3200');
-- -- Độ phân giải
--
-- -- Thuộc tính cho Bàn phím cơ Blue Switch (Product ID: 3)
-- INSERT INTO product_attribute_values (product_id, attribute_id, value)
-- VALUES (3, 6, 'Blue Switch'), -- Loại bàn phím
--        (3, 7, '1'); -- Tốc độ phản hồi 1ms

-- Reset sequence để ID bắt đầu từ 1
SELECT setval('product_id_seq', 1, false);

INSERT INTO product (title, description, price, quantity, category_id, is_active, created_at, image_url)
VALUES
-- LAPTOP (ID 1-5)
('ASUS TUF Gaming A15', 'Laptop gaming bền bỉ, hiệu năng cao', 21990000, 50, 1, TRUE, NOW(), '1.png'),
('MacBook Air M2', 'Mỏng nhẹ, pin cực lâu cho văn phòng', 26500000, 30, 1, TRUE, NOW(), '2.png'),
('Dell XPS 13', 'Màn hình vô cực, đẳng cấp doanh nhân', 35000000, 15, 1, TRUE, NOW(), '3.png'),
('HP Victus 16', 'Cấu hình mạnh, tản nhiệt tốt', 19500000, 25, 1, TRUE, NOW(), '4.png'),
('Lenovo Legion 5', 'Vua của phân khúc laptop gaming tầm trung', 28900000, 12, 1, TRUE, NOW(), '5.png'),

-- ĐIỆN THOẠI (ID 6-10)
('iPhone 15 Pro Max', 'Titanium bền bỉ, camera siêu zoom', 31500000, 40, 2, TRUE, NOW(), '6.png'),
('Samsung Galaxy S24 Ultra', 'AI Phone đỉnh cao, bút S-Pen tiện lợi', 27900000, 35, 2, TRUE, NOW(), '7.png'),
('Xiaomi 14', 'Cấu hình khủng, sạc siêu nhanh', 17500000, 60, 2, TRUE, NOW(), '8.png'),
('Oppo Reno 11 Pro', 'Chuyên gia chân dung, thiết kế đẹp', 13900000, 45, 2, TRUE, NOW(), '9.png'),
('Google Pixel 8', 'Camera AI thông minh nhất', 18000000, 10, 2, TRUE, NOW(), '10.png'),

-- PHỤ KIỆN (ID 11-15)
('Chuột Logitech G502', 'Chuột gaming quốc dân', 1200000, 100, 4, TRUE, NOW(), '11.png'),
('Bàn phím Akko 3068', 'Bàn phím cơ nhỏ gọn, switch gõ êm', 1850000, 50, 3, TRUE, NOW(), '12.png'),
('Tai nghe HyperX Cloud II', 'Âm thanh 7.1 cho game thủ', 2100000, 75, 5, TRUE, NOW(), '13.png'),
('Tai nghe Sony WH-1000XM5', 'Chống ồn chủ động tốt nhất', 7500000, 20, 5, TRUE, NOW(), '14.png'),
('Apple Magic Mouse', 'Chuột đa điểm mượt mà cho Mac', 2200000, 40, 4, TRUE, NOW(), '15.png');



WITH attrs AS (SELECT id, name FROM product_attributes)

INSERT
INTO product_attribute_values (product_id, attribute_id, value)
VALUES
-- ========================================================
-- DANH MỤC 1: LAPTOP (ID 1-5)
-- ========================================================

-- 1. ASUS TUF Gaming A15
(1, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'AMD Ryzen 7'),
(1, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'AMD Ryzen 7 7435HS'),
(1, (SELECT id FROM attrs WHERE name = 'Số nhân/Số luồng'), '8 nhân / 16 luồng'),
(1, (SELECT id FROM attrs WHERE name = 'Card đồ họa (onboard)'), 'AMD Radeon Graphics'),
(1, (SELECT id FROM attrs WHERE name = 'Card đồ họa (rời)'), 'NVIDIA RTX 3050 4GB'),
(1, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '16'),
(1, (SELECT id FROM attrs WHERE name = 'Dung lượng SSD'), '512'),
(1, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '15.6'),
(1, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1920 x 1080'),
(1, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '144'),
(1, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Windows'),
(1, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '2.3'),
(1, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '48Wh'),

-- 2. MacBook Air M2
(2, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Apple M2'),
(2, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Apple M2'),
(2, (SELECT id FROM attrs WHERE name = 'Card đồ họa (onboard)'), 'Apple M2 8-core GPU'),
(2, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '8'),
(2, (SELECT id FROM attrs WHERE name = 'Dung lượng SSD'), '256'),
(2, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '13.6'),
(2, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '2560 x 1664'),
(2, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '60'),
(2, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'macOS'),
(2, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '1.24'),
(2, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '52.6Wh'),

-- 3. Dell XPS 13
(3, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Intel Core i7'),
(3, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Intel Core i7-1250U'),
(3, (SELECT id FROM attrs WHERE name = 'Số nhân/Số luồng'), '8 nhân / 16 luồng'),
(3, (SELECT id FROM attrs WHERE name = 'Card đồ họa (onboard)'), 'Intel Iris Xe'),
(3, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '16'),
(3, (SELECT id FROM attrs WHERE name = 'Dung lượng SSD'), '512'),
(3, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '13.4'),
(3, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1920 x 1200'),
(3, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '120'),
(3, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Windows'),
(3, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '1.17'),
(3, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '52.6Wh'),

-- 4. HP Victus 16
(4, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Intel Core i5'),
(4, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Intel Core i5-13500H'),
(4, (SELECT id FROM attrs WHERE name = 'Số nhân/Số luồng'), '8 nhân / 16 luồng'),
(4, (SELECT id FROM attrs WHERE name = 'Card đồ họa (rời)'), 'NVIDIA RTX 4050 6GB'),
(4, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '16'),
(4, (SELECT id FROM attrs WHERE name = 'Dung lượng SSD'), '512'),
(4, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '16.1'),
(4, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1920 x 1080'),
(4, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '144'),
(4, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Windows'),
(4, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '2.31'),
(4, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '48Wh'),

-- 5. Lenovo Legion 5
(5, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'AMD Ryzen 7'),
(5, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'AMD Ryzen 7 7735H'),
(5, (SELECT id FROM attrs WHERE name = 'Số nhân/Số luồng'), '8 nhân / 16 luồng'),
(5, (SELECT id FROM attrs WHERE name = 'Card đồ họa (rời)'), 'NVIDIA RTX 4060 8GB'),
(5, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '16'),
(5, (SELECT id FROM attrs WHERE name = 'Dung lượng SSD'), '512'),
(5, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '15.6'),
(5, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1920 x 1080'),
(5, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '165'),
(5, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Windows'),
(5, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '2.4'),
(5, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '60Wh'),

-- ========================================================
-- DANH MỤC 2: ĐIỆN THOẠI (ID 6-10)
-- ========================================================

-- 6. iPhone 15 Pro Max
(6, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Apple A17'),
(6, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Apple A17 Pro'),
(6, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '8'),
(6, (SELECT id FROM attrs WHERE name = 'Dung lượng ROM'), '256'),
(6, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '6.7'),
(6, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '2796 x 1290'),
(6, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '120'),
(6, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'iOS'),
(6, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '4441 mAh'),
(6, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.221'),

-- 7. Samsung Galaxy S24 Ultra
(7, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Snapdragon 8 Gen 3'),
(7, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Snapdragon 8 Gen 3'),
(7, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '12'),
(7, (SELECT id FROM attrs WHERE name = 'Dung lượng ROM'), '256'),
(7, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '6.8'),
(7, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '3000 x 1500'),
(7, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '120'),
(7, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Android'),
(7, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '5000 mAh'),
(7, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.221'),

-- 8. Xiaomi 14
(8, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Snapdragon 8 Gen 3'),
(8, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Snapdragon 8 Gen 3'),
(8, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '12'),
(8, (SELECT id FROM attrs WHERE name = 'Dung lượng ROM'), '256'),
(8, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '6.36'),
(8, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1500 x 750'),
(8, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '60'),
(8, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Android'),
(8, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '4610 mAh'),
(8, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.221'),

-- 9. Oppo Reno 11 Pro
(9, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Dimensity 8200'),
(9, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Dimensity 8200'),
(9, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '12'),
(9, (SELECT id FROM attrs WHERE name = 'Dung lượng ROM'), '512'),
(9, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '6.36'),
(9, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1500 x 750'),
(9, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '100'),
(9, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Android'),
(9, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '4610 mAh'),
(9, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.221'),

-- 10. Google Pixel 8
(10, (SELECT id FROM attrs WHERE name = 'Công nghệ CPU'), 'Google Tensor'),
(10, (SELECT id FROM attrs WHERE name = 'Tên đầy đủ CPU'), 'Tensor G3'),
(10, (SELECT id FROM attrs WHERE name = 'Dung lượng RAM'), '8'),
(10, (SELECT id FROM attrs WHERE name = 'Dung lượng ROM'), '128'),
(10, (SELECT id FROM attrs WHERE name = 'Kích thước màn hình'), '6.36'),
(10, (SELECT id FROM attrs WHERE name = 'Độ phân giải'), '1500 x 750'),
(10, (SELECT id FROM attrs WHERE name = 'Tần số quét'), '120'),
(10, (SELECT id FROM attrs WHERE name = 'Hệ điều hành'), 'Android'),
(10, (SELECT id FROM attrs WHERE name = 'Dung lượng Pin'), '4610 mAh'),
(10, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.221'),

-- ========================================================
-- DANH MỤC 4: CHUỘT (ID 11, 15)
-- ========================================================

-- 11. Chuột Logitech G502 (Có dây)
(11, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'USB'),
(11, (SELECT id FROM attrs WHERE name = 'DPI'), '25600'),
(11, (SELECT id FROM attrs WHERE name = 'LED'), 'Có'),
(11, (SELECT id FROM attrs WHERE name = 'Loại sản phẩm'), 'Có dây'),
(11, (SELECT id FROM attrs WHERE name = 'Tính năng'), 'Cảm biến HERO 25K'),
(11, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.121'),

-- 15. Apple Magic Mouse (Không dây)
(15, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'Bluetooth'),
(15, (SELECT id FROM attrs WHERE name = 'DPI'), '1300'),
(15, (SELECT id FROM attrs WHERE name = 'LED'), 'Không'),
(15, (SELECT id FROM attrs WHERE name = 'Loại sản phẩm'), 'Không dây'),
(15, (SELECT id FROM attrs WHERE name = 'Tính năng'), 'Cảm ứng đa điểm'),
(15, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.099'),
(15, (SELECT id FROM attrs WHERE name = 'Thời gian sử dụng pin'), '720'), -- ~1 tháng

-- ========================================================
-- DANH MỤC 3: BÀN PHÍM (ID 12)
-- ========================================================

-- 12. Bàn phím Akko 3068 (Cơ, không dây)
(12, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'Bluetooth'),
(12, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'USB Receiver'),
(12, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'USB'),
(12, (SELECT id FROM attrs WHERE name = 'Loại Switch'), 'Akko CS Blue'),
(12, (SELECT id FROM attrs WHERE name = 'LED'), 'Có'),
(12, (SELECT id FROM attrs WHERE name = 'Loại sản phẩm'), 'Bàn phím Cơ'),
(12, (SELECT id FROM attrs WHERE name = 'Thời gian sử dụng pin'), '200'),
(12, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.7'),

-- ========================================================
-- DANH MỤC 5: TAI NGHE (ID 13, 14)
-- ========================================================

-- 13. Tai nghe HyperX Cloud II (Có dây, Over-ear)
(13, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'USB Receiver'),
(13, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'Jack 3.5mm'),
(13, (SELECT id FROM attrs WHERE name = 'Loại sản phẩm'), 'Over-ear'),
(13, (SELECT id FROM attrs WHERE name = 'Tính năng'), 'Giả lập âm thanh vòm 7.1'),
(13, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.32'),

-- 14. Tai nghe Sony WH-1000XM5 (Không dây, Over-ear)
(14, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'Bluetooth'),
(14, (SELECT id FROM attrs WHERE name = 'Kiểu kết nối'), 'Jack 3.5mm'),
(14, (SELECT id FROM attrs WHERE name = 'Loại sản phẩm'), 'Over-ear'),
(14, (SELECT id FROM attrs WHERE name = 'Tính năng'), 'Chống ồn chủ động (ANC)'),
(14, (SELECT id FROM attrs WHERE name = 'Thời gian sử dụng pin'), '30'),
(14, (SELECT id FROM attrs WHERE name = 'Trọng lượng'), '0.25');