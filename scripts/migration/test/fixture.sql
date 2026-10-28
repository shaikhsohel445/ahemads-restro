-- Fixture for verifying the PostgreSQL -> D1 migration end to end
-- (scripts/migration/test/run-local.sh). Loaded into a throwaway PostgreSQL
-- that has the original 38 migrations applied. Covers every conversion the
-- transform does: timestamps, DATE, numeric, booleans, enums, jsonb, text[]
-- and int[] arrays, bytea attachments (-> R2), secrets that must be
-- scrubbed (backup_config) and tables that are skipped (sync_*).
-- Login after import: owner@fixture.test / Password123!
BEGIN;
INSERT INTO restaurants (id, name, "legalName", currency, timezone, "loyaltyPointValue", "updatedAt")
VALUES ('rst_fixture', 'مطعم البيت — Al Bait', 'Al Bait Trading Co.', 'INR', 'Asia/Kolkata', 0.50, '2026-09-01 10:00:00.123');

INSERT INTO branches (id, "restaurantId", name, address, "gstNumber", country, "taxRegime", "taxMode", "updatedAt", "createdAt")
VALUES ('br_fixture', 'rst_fixture', 'Main — الرئيسي', 'MG Road', '29ABCDE1234F1Z5', 'IN', 'INDIA_GST', 'INCLUSIVE', '2026-09-01 10:00:00', '2026-09-01 10:00:00');

INSERT INTO permissions (id, key, label, category) VALUES
  ('perm_1', 'orders.create', 'Create orders', 'Orders'),
  ('perm_2', 'bills.print', 'Print bills', 'Orders'),
  ('perm_3', 'settings.manage', 'Manage settings', 'Settings');
INSERT INTO roles (id, "restaurantId", name, label) VALUES ('role_owner', 'rst_fixture', 'OWNER', 'Owner');
INSERT INTO role_permissions ("roleId", "permissionId") VALUES ('role_owner', 'perm_1'), ('role_owner', 'perm_2'), ('role_owner', 'perm_3');

INSERT INTO users (id, "restaurantId", "roleId", name, email, "passwordHash", "twoFactorRecoveryHashes", "updatedAt")
VALUES ('usr_owner', 'rst_fixture', 'role_owner', 'O''Brien Owner', 'owner@fixture.test',
        '$2b$10$xk/k4sQgqb8qnSwlpBU7jO.5BcxSjiz2Jd3faFVcezPzE0aIdl9Ua', '{"$2b$10$aaa","$2b$10$b,b"}', '2026-09-01 10:00:00');
INSERT INTO user_branches ("userId", "branchId") VALUES ('usr_owner', 'br_fixture');

INSERT INTO floors (id, "branchId", name) VALUES ('flr_1', 'br_fixture', 'Ground');
INSERT INTO tables (id, "floorId", number, name, capacity, status, "qrToken", "updatedAt")
VALUES ('tbl_1', 'flr_1', '1', 'Table 1', 4, 'OCCUPIED', 'qr-fixture-1', '2026-09-01 10:00:00');

INSERT INTO menu_categories (id, "branchId", name) VALUES ('cat_1', 'br_fixture', 'مشويات — Grills');
INSERT INTO menu_items (id, "branchId", "categoryId", name, price, "taxRatePercent", allergens, "isVeg", "updatedAt")
VALUES ('itm_1', 'br_fixture', 'cat_1', 'شاورما — Shawarma', 23.50, 5, '{gluten,"sesame seeds"}', false, '2026-09-01 10:00:00'),
       ('itm_2', 'br_fixture', 'cat_1', 'Hummus', 18, 5, '{}', true, '2026-09-01 10:00:00');

INSERT INTO orders (id, "branchId", "orderNumber", "createdById", type, status, "tableId", subtotal, "taxAmount", "discountAmount", "tipAmount", "totalAmount", "createdAt", "updatedAt")
VALUES ('ord_1', 'br_fixture', 'ORD-0001', 'usr_owner', 'DINE_IN', 'PAID', 'tbl_1', 65.00, 3.10, 0, 0, 65.00, '2026-09-02 13:45:10.5', '2026-09-02 14:00:00'),
       ('ord_2', 'br_fixture', 'ORD-0002', 'usr_owner', 'TAKEAWAY', 'OPEN', NULL, 18.00, 0.86, 0, 0, 18.00, '2026-09-03 08:00:00', '2026-09-03 08:00:00');
INSERT INTO order_items (id, "orderId", "menuItemId", "nameSnapshot", quantity, "unitPriceSnapshot", "taxRateSnapshot", "lineTotal")
VALUES ('oi_1', 'ord_1', 'itm_1', 'شاورما — Shawarma', 2, 23.50, 5, 47.00),
       ('oi_2', 'ord_1', 'itm_2', 'Hummus', 1, 18.00, 5, 18.00),
       ('oi_3', 'ord_2', 'itm_2', 'Hummus', 1, 18.00, 5, 18.00);
INSERT INTO payments (id, "orderId", method, amount, tendered, "changeGiven")
VALUES ('pay_1', 'ord_1', 'CASH', 50.00, 50.00, 0), ('pay_2', 'ord_1', 'UPI', 15.00, NULL, NULL);

INSERT INTO documents (id, "branchId", title, body, "updatedAt") VALUES ('doc_1', 'br_fixture', 'Fire licence', 'Renew yearly', '2026-09-01 10:00:00');
INSERT INTO document_files (id, "documentId", "fileName", "mimeType", size, data)
VALUES ('df_1', 'doc_1', 'licence.pdf', 'application/pdf', 9, '\x255044462d312e340a'::bytea);

INSERT INTO delivery_zones (id, "branchId", name, pincodes) VALUES ('dz_1', 'br_fixture', 'Central', '{560001,560002}');
INSERT INTO promotions (id, "branchId", name, kind, value, "startMinute", "endMinute", "daysOfWeek")
VALUES ('promo_1', 'br_fixture', 'Happy hour', 'PERCENT', 10, 960, 1140, '{0,5,6}');
INSERT INTO bank_transactions (id, "branchId", "postedOn", description, amount, reference)
VALUES ('bt_1', 'br_fixture', '2026-09-02', 'POS settlement', 65.00, 'REF-1');
INSERT INTO webhook_endpoints (id, "restaurantId", url, secret, events) VALUES ('wh_1', 'rst_fixture', 'https://example.test/hook', 'sealed:abc', '{order.paid,order.created}');
INSERT INTO backup_config (id, endpoint, bucket, "accessKeyId", "secretAccessKey", "updatedAt")
VALUES ('singleton', 'https://s3.example.test', 'old-bucket', 'AKIA-REAL-LOOKING', 'super-secret-value', '2026-09-01 10:00:00');
INSERT INTO audit_logs (id, "userId", action, entity, metadata) VALUES ('al_1', 'usr_owner', 'order.paid', 'Order', '{"orderNumber": "ORD-0001", "amounts": [50, 15]}');
INSERT INTO sync_state (id) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
