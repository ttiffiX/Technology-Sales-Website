-- Tăng tốc lọc sản phẩm theo danh mục
CREATE INDEX idx_product_category ON product (category_id);

-- Tăng tốc tìm kiếm theo tên sản phẩm (Cơ bản)
CREATE INDEX idx_product_title ON product (title);

-- Tăng tốc lọc theo khoảng giá (WHERE price BETWEEN x AND y)
CREATE INDEX idx_product_price ON product (price);

-- Tăng tốc sắp xếp sản phẩm mới nhất (ORDER BY created_at DESC)
CREATE INDEX idx_product_created_at ON product (created_at DESC);

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

CREATE INDEX idx_product_attributes ON product USING GIN (attributes);

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
    is_banned  BOOLEAN DEFAULT FALSE,
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
    attributes    JSONB,
    -- Khóa ngoại đến Categories
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

--------------------------
-- BẢNG QUAN HỆ (RELATIONSHIP TABLES)
--------------------------

drop table category_attribute_schema;
CREATE TABLE category_attribute_schema
(
    id            SERIAL PRIMARY KEY,
    category_id   INT         NOT NULL,
    name          VARCHAR(50) NOT NULL, -- "Công nghệ CPU", "Dung lượng RAM"...
    unit          VARCHAR(20),          -- "GB", "inch"...
    data_type     VARCHAR(20),          -- "Text" | "Number"
    is_filterable BOOLEAN DEFAULT false,
    code          VARCHAR(50) NOT NULL,
    group_name    VARCHAR(50),          -- "Bộ xử lý", "RAM & Ổ cứng", "Màn hình"...
    group_order   INT     DEFAULT 0,    -- thứ tự của NHÓM
    display_order INT     DEFAULT 0,    -- thứ tự của ATTRIBUTE trong nhóm
    CONSTRAINT fk_cas_category FOREIGN KEY (category_id) REFERENCES categories (id),
    UNIQUE (category_id, code)
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
    id            SERIAL PRIMARY KEY,
    user_id       INT UNIQUE   NOT NULL,
    token         VARCHAR(255) NOT NULL,
    expiry_date   TIMESTAMP    NOT NULL,
    is_used       BOOLEAN DEFAULT FALSE,
    last_sent     TIMESTAMP    NOT NULL,
    attempt_count INT     DEFAULT 0,
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
    expiry_at  TIMESTAMP    NOT NULL,
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

-- ============================================================
-- JSONB MIGRATION: category_attribute_schema + product.attributes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. CATEGORY_ATTRIBUTE_SCHEMA
--    Mỗi category có schema riêng, gồm: code (key JSONB),
--    name (hiển thị UI), group_name, group_order, display_order
-- ----------------------------------------------------------------

-- Category 1: Máy tính xách tay
INSERT INTO category_attribute_schema
(category_id, code, name, unit, data_type, is_filterable, group_name, group_order, display_order)
VALUES
-- Nhóm 1: Bộ xử lý
(1, 'cpu_tech', 'Công nghệ CPU', NULL, 'Text', true, 'Bộ xử lý & Đồ họa', 1, 1),
(1, 'cpu_name', 'Tên đầy đủ CPU', NULL, 'Text', false, 'Bộ xử lý & Đồ họa', 1, 2),
(1, 'cpu_cores', 'Số nhân / Số luồng', NULL, 'Text', false, 'Bộ xử lý & Đồ họa', 1, 3),
(1, 'gpu_onboard', 'Card đồ họa (onboard)', NULL, 'Text', false, 'Bộ xử lý & Đồ họa', 1, 4),
(1, 'gpu_discrete', 'Card đồ họa (rời)', NULL, 'Text', true, 'Bộ xử lý & Đồ họa', 1, 5),
-- Nhóm 2: RAM & Ổ cứng
(1, 'ram_size', 'Dung lượng RAM', 'GB', 'Number', true, 'RAM & Ổ cứng', 2, 1),
(1, 'storage', 'Dung lượng SSD', 'GB', 'Number', true, 'RAM & Ổ cứng', 2, 2),
-- Nhóm 3: Màn hình
(1, 'screen_size', 'Kích thước màn hình', 'inch', 'Number', true, 'Màn hình', 3, 1),
(1, 'screen_res', 'Độ phân giải', NULL, 'Text', false, 'Màn hình', 3, 2),
(1, 'screen_refresh', 'Tần số quét', 'Hz', 'Number', true, 'Màn hình', 3, 3),
-- Nhóm 4: Thông số khác
(1, 'os', 'Hệ điều hành', NULL, 'Text', true, 'Thông số khác', 4, 1),
(1, 'weight', 'Trọng lượng', 'kg', 'Number', false, 'Thông số khác', 4, 2),
(1, 'battery', 'Dung lượng pin', NULL, 'Text', false, 'Thông số khác', 4, 3);

-- Category 2: Điện thoại di động
INSERT INTO category_attribute_schema
(category_id, code, name, unit, data_type, is_filterable, group_name, group_order, display_order)
VALUES
-- Nhóm 1: Bộ xử lý
(2, 'cpu_tech', 'Công nghệ CPU', NULL, 'Text', true, 'Bộ xử lý', 1, 1),
(2, 'cpu_name', 'Tên đầy đủ CPU', NULL, 'Text', false, 'Bộ xử lý', 1, 2),
-- Nhóm 2: Bộ nhớ
(2, 'ram_size', 'Dung lượng RAM', 'GB', 'Number', true, 'Bộ nhớ', 2, 1),
(2, 'rom_size', 'Dung lượng ROM', 'GB', 'Number', true, 'Bộ nhớ', 2, 2),
-- Nhóm 3: Màn hình
(2, 'screen_size', 'Kích thước màn hình', 'inch', 'Number', true, 'Màn hình', 3, 1),
(2, 'screen_res', 'Độ phân giải', NULL, 'Text', false, 'Màn hình', 3, 2),
(2, 'screen_refresh', 'Tần số quét', 'Hz', 'Number', true, 'Màn hình', 3, 3),
-- Nhóm 4: Thông số khác
(2, 'os', 'Hệ điều hành', NULL, 'Text', true, 'Thông số khác', 4, 1),
(2, 'battery', 'Dung lượng pin', NULL, 'Text', false, 'Thông số khác', 4, 2),
(2, 'weight', 'Trọng lượng', 'kg', 'Number', false, 'Thông số khác', 4, 3);

-- Category 3: Bàn phím
INSERT INTO category_attribute_schema
(category_id, code, name, unit, data_type, is_filterable, group_name, group_order, display_order)
VALUES
-- Nhóm 1: Kết nối
(3, 'connections', 'Kiểu kết nối', NULL, 'Text', true, 'Kết nối', 1, 1),
-- Nhóm 2: Thông số phím
(3, 'switch_type', 'Loại Switch', NULL, 'Text', true, 'Thông số phím', 2, 1),
(3, 'led', 'LED', NULL, 'Text', true, 'Thông số phím', 2, 2),
(3, 'product_type', 'Loại sản phẩm', NULL, 'Text', true, 'Thông số phím', 2, 3),
-- Nhóm 3: Thông số khác
(3, 'battery_life', 'Thời gian dùng pin', 'giờ', 'Number', false, 'Thông số khác', 3, 1),
(3, 'weight', 'Trọng lượng', 'kg', 'Number', false, 'Thông số khác', 3, 2);

-- Category 4: Chuột
INSERT INTO category_attribute_schema
(category_id, code, name, unit, data_type, is_filterable, group_name, group_order, display_order)
VALUES
-- Nhóm 1: Kết nối
(4, 'connections', 'Kiểu kết nối', NULL, 'Text', true, 'Kết nối', 1, 1),
-- Nhóm 2: Thông số chuột
(4, 'dpi', 'DPI', NULL, 'Text', true, 'Thông số chuột', 2, 1),
(4, 'led', 'LED', NULL, 'Text', true, 'Thông số chuột', 2, 2),
(4, 'product_type', 'Loại sản phẩm', NULL, 'Text', true, 'Thông số chuột', 2, 3),
(4, 'features', 'Tính năng', NULL, 'Text', false, 'Thông số chuột', 2, 4),
-- Nhóm 3: Thông số khác
(4, 'battery_life', 'Thời gian dùng pin', 'giờ', 'Number', false, 'Thông số khác', 3, 1),
(4, 'weight', 'Trọng lượng', 'kg', 'Number', false, 'Thông số khác', 3, 2);

-- Category 5: Tai nghe
INSERT INTO category_attribute_schema
(category_id, code, name, unit, data_type, is_filterable, group_name, group_order, display_order)
VALUES
-- Nhóm 1: Kết nối
(5, 'connections', 'Kiểu kết nối', NULL, 'Text', true, 'Kết nối', 1, 1),
-- Nhóm 2: Thông số tai nghe
(5, 'product_type', 'Loại sản phẩm', NULL, 'Text', true, 'Thông số tai nghe', 2, 1),
(5, 'features', 'Tính năng', NULL, 'Text', false, 'Thông số tai nghe', 2, 2),
-- Nhóm 3: Thông số khác
(5, 'battery_life', 'Thời gian dùng pin', 'giờ', 'Number', true, 'Thông số khác', 3, 1),
(5, 'weight', 'Trọng lượng', 'kg', 'Number', false, 'Thông số khác', 3, 2);


-- ----------------------------------------------------------------
-- 2. UPDATE product.attributes (JSONB)
--    Quy tắc:
--    - Key = code từ category_attribute_schema
--    - Giá trị Number lưu số thuần (không kèm đơn vị)
--    - Multi-value (kết nối, tính năng) lưu JSON array
-- ----------------------------------------------------------------

-- ========================
-- CATEGORY 1: LAPTOP (ID 1–5)
-- ========================

-- 1. ASUS TUF Gaming A15
UPDATE product
SET attributes = '{
  "cpu_tech": "AMD Ryzen 7",
  "cpu_name": "AMD Ryzen 7 7435HS",
  "cpu_cores": "8 nhân / 16 luồng",
  "gpu_onboard": "AMD Radeon Graphics",
  "gpu_discrete": "NVIDIA RTX 3050 4GB",
  "ram_size": 16,
  "storage": 512,
  "screen_size": 15.6,
  "screen_res": "1920 x 1080",
  "screen_refresh": 144,
  "os": "Windows",
  "weight": 2.3,
  "battery": "48Wh"
}'::jsonb
WHERE id = 1;

-- 2. MacBook Air M2
UPDATE product
SET attributes = '{
  "cpu_tech": "Apple M2",
  "cpu_name": "Apple M2",
  "gpu_onboard": "Apple M2 8-core GPU",
  "ram_size": 8,
  "storage": 256,
  "screen_size": 13.6,
  "screen_res": "2560 x 1664",
  "screen_refresh": 60,
  "os": "macOS",
  "weight": 1.24,
  "battery": "52.6Wh"
}'::jsonb
WHERE id = 2;

-- 3. Dell XPS 13
UPDATE product
SET attributes = '{
  "cpu_tech": "Intel Core i7",
  "cpu_name": "Intel Core i7-1250U",
  "cpu_cores": "8 nhân / 16 luồng",
  "gpu_onboard": "Intel Iris Xe",
  "ram_size": 16,
  "storage": 512,
  "screen_size": 13.4,
  "screen_res": "1920 x 1200",
  "screen_refresh": 120,
  "os": "Windows",
  "weight": 1.17,
  "battery": "52.6Wh"
}'::jsonb
WHERE id = 3;

-- 4. HP Victus 16
UPDATE product
SET attributes = '{
  "cpu_tech": "Intel Core i5",
  "cpu_name": "Intel Core i5-13500H",
  "cpu_cores": "8 nhân / 16 luồng",
  "gpu_discrete": "NVIDIA RTX 4050 6GB",
  "ram_size": 16,
  "storage": 512,
  "screen_size": 16.1,
  "screen_res": "1920 x 1080",
  "screen_refresh": 144,
  "os": "Windows",
  "weight": 2.31,
  "battery": "48Wh"
}'::jsonb
WHERE id = 4;

-- 5. Lenovo Legion 5
UPDATE product
SET attributes = '{
  "cpu_tech": "AMD Ryzen 7",
  "cpu_name": "AMD Ryzen 7 7735H",
  "cpu_cores": "8 nhân / 16 luồng",
  "gpu_discrete": "NVIDIA RTX 4060 8GB",
  "ram_size": 16,
  "storage": 512,
  "screen_size": 15.6,
  "screen_res": "1920 x 1080",
  "screen_refresh": 165,
  "os": "Windows",
  "weight": 2.4,
  "battery": "60Wh"
}'::jsonb
WHERE id = 5;

-- ========================
-- CATEGORY 2: ĐIỆN THOẠI (ID 6–10)
-- ========================

-- 6. iPhone 15 Pro Max
UPDATE product
SET attributes = '{
  "cpu_tech": "Apple A17",
  "cpu_name": "Apple A17 Pro",
  "ram_size": 8,
  "rom_size": 256,
  "screen_size": 6.7,
  "screen_res": "2796 x 1290",
  "screen_refresh": 120,
  "os": "iOS",
  "battery": "4441 mAh",
  "weight": 0.221
}'::jsonb
WHERE id = 6;

-- 7. Samsung Galaxy S24 Ultra
UPDATE product
SET attributes = '{
  "cpu_tech": "Snapdragon 8 Gen 3",
  "cpu_name": "Snapdragon 8 Gen 3",
  "ram_size": 12,
  "rom_size": 256,
  "screen_size": 6.8,
  "screen_res": "3000 x 1500",
  "screen_refresh": 120,
  "os": "Android",
  "battery": "5000 mAh",
  "weight": 0.221
}'::jsonb
WHERE id = 7;

-- 8. Xiaomi 14
UPDATE product
SET attributes = '{
  "cpu_tech": "Snapdragon 8 Gen 3",
  "cpu_name": "Snapdragon 8 Gen 3",
  "ram_size": 12,
  "rom_size": 256,
  "screen_size": 6.36,
  "screen_res": "1500 x 750",
  "screen_refresh": 60,
  "os": "Android",
  "battery": "4610 mAh",
  "weight": 0.221
}'::jsonb
WHERE id = 8;

-- 9. Oppo Reno 11 Pro
UPDATE product
SET attributes = '{
  "cpu_tech": "Dimensity 8200",
  "cpu_name": "Dimensity 8200",
  "ram_size": 12,
  "rom_size": 512,
  "screen_size": 6.36,
  "screen_res": "1500 x 750",
  "screen_refresh": 100,
  "os": "Android",
  "battery": "4610 mAh",
  "weight": 0.221
}'::jsonb
WHERE id = 9;

-- 10. Google Pixel 8
UPDATE product
SET attributes = '{
  "cpu_tech": "Google Tensor",
  "cpu_name": "Tensor G3",
  "ram_size": 8,
  "rom_size": 128,
  "screen_size": 6.36,
  "screen_res": "1500 x 750",
  "screen_refresh": 120,
  "os": "Android",
  "battery": "4610 mAh",
  "weight": 0.221
}'::jsonb
WHERE id = 10;

-- ========================
-- CATEGORY 4: CHUỘT (ID 11, 15)
-- ========================

-- 11. Chuột Logitech G502 (Có dây)
UPDATE product
SET attributes = '{
  "connections": [
    "USB"
  ],
  "dpi": "25600",
  "led": "Có",
  "product_type": "Có dây",
  "features": "Cảm biến HERO 25K",
  "weight": 0.121
}'::jsonb
WHERE id = 11;

-- 15. Apple Magic Mouse (Không dây)
UPDATE product
SET attributes = '{
  "connections": [
    "Bluetooth"
  ],
  "dpi": "1300",
  "led": "Không",
  "product_type": "Không dây",
  "features": "Cảm ứng đa điểm",
  "battery_life": 720,
  "weight": 0.099
}'::jsonb
WHERE id = 15;

-- ========================
-- CATEGORY 3: BÀN PHÍM (ID 12)
-- ========================

-- 12. Bàn phím Akko 3068 (Cơ, 3 mode)
UPDATE product
SET attributes = '{
  "connections": [
    "Bluetooth",
    "USB Receiver",
    "USB"
  ],
  "switch_type": "Akko CS Blue",
  "led": "Có",
  "product_type": "Bàn phím Cơ",
  "battery_life": 200,
  "weight": 0.7
}'::jsonb
WHERE id = 12;

-- ========================
-- CATEGORY 5: TAI NGHE (ID 13, 14)
-- ========================

-- 13. Tai nghe HyperX Cloud II
UPDATE product
SET attributes = '{
  "connections": [
    "USB Receiver",
    "Jack 3.5mm"
  ],
  "product_type": "Over-ear",
  "features": "Giả lập âm thanh vòm 7.1",
  "weight": 0.32
}'::jsonb
WHERE id = 13;

-- 14. Tai nghe Sony WH-1000XM5
UPDATE product
SET attributes = '{
  "connections": [
    "Bluetooth",
    "Jack 3.5mm"
  ],
  "product_type": "Over-ear",
  "features": "Chống ồn chủ động (ANC)",
  "battery_life": 30,
  "weight": 0.25
}'::jsonb
WHERE id = 14;
