// GENERATED list of message namespaces — one JSON file per screen area in
// messages/<locale>/<namespace>.json. Keys are looked up as
// "<namespace>.<key>" (e.g. t("pos.checkout.title")). To add a namespace,
// create the file for every locale and add it to NAMESPACES below.
//
// Files are imported statically so the bundler includes them; a missing key
// falls back to English, then to the key itself (see context.tsx).

import en_common from "../../messages/en/common.json";
import en_nav from "../../messages/en/nav.json";
import en_auth from "../../messages/en/auth.json";
import en_dashboard from "../../messages/en/dashboard.json";
import en_pos from "../../messages/en/pos.json";
import en_orders from "../../messages/en/orders.json";
import en_tables from "../../messages/en/tables.json";
import en_kds from "../../messages/en/kds.json";
import en_menu from "../../messages/en/menu.json";
import en_inventory from "../../messages/en/inventory.json";
import en_settings from "../../messages/en/settings.json";
import en_team from "../../messages/en/team.json";
import en_attendance from "../../messages/en/attendance.json";
import en_accounting from "../../messages/en/accounting.json";
import en_marketing from "../../messages/en/marketing.json";
import en_reservations from "../../messages/en/reservations.json";
import en_customers from "../../messages/en/customers.json";
import en_reports from "../../messages/en/reports.json";
import en_operations from "../../messages/en/operations.json";
import en_delivery from "../../messages/en/delivery.json";
import en_kiosk from "../../messages/en/kiosk.json";
import en_order from "../../messages/en/order.json";
import en_notifications from "../../messages/en/notifications.json";
import en_layout from "../../messages/en/layout.json";
import en_errors from "../../messages/en/errors.json";
import en_customerDisplay from "../../messages/en/customerDisplay.json";
import en_docs from "../../messages/en/docs.json";
import ar_common from "../../messages/ar/common.json";
import ar_nav from "../../messages/ar/nav.json";
import ar_auth from "../../messages/ar/auth.json";
import ar_dashboard from "../../messages/ar/dashboard.json";
import ar_pos from "../../messages/ar/pos.json";
import ar_orders from "../../messages/ar/orders.json";
import ar_tables from "../../messages/ar/tables.json";
import ar_kds from "../../messages/ar/kds.json";
import ar_menu from "../../messages/ar/menu.json";
import ar_inventory from "../../messages/ar/inventory.json";
import ar_settings from "../../messages/ar/settings.json";
import ar_team from "../../messages/ar/team.json";
import ar_attendance from "../../messages/ar/attendance.json";
import ar_accounting from "../../messages/ar/accounting.json";
import ar_marketing from "../../messages/ar/marketing.json";
import ar_reservations from "../../messages/ar/reservations.json";
import ar_customers from "../../messages/ar/customers.json";
import ar_reports from "../../messages/ar/reports.json";
import ar_operations from "../../messages/ar/operations.json";
import ar_delivery from "../../messages/ar/delivery.json";
import ar_kiosk from "../../messages/ar/kiosk.json";
import ar_order from "../../messages/ar/order.json";
import ar_notifications from "../../messages/ar/notifications.json";
import ar_layout from "../../messages/ar/layout.json";
import ar_errors from "../../messages/ar/errors.json";
import ar_customerDisplay from "../../messages/ar/customerDisplay.json";
import ar_docs from "../../messages/ar/docs.json";
import es_common from "../../messages/es/common.json";
import es_nav from "../../messages/es/nav.json";
import es_auth from "../../messages/es/auth.json";
import es_dashboard from "../../messages/es/dashboard.json";
import es_pos from "../../messages/es/pos.json";
import es_orders from "../../messages/es/orders.json";
import es_tables from "../../messages/es/tables.json";
import es_kds from "../../messages/es/kds.json";
import es_menu from "../../messages/es/menu.json";
import es_inventory from "../../messages/es/inventory.json";
import es_settings from "../../messages/es/settings.json";
import es_team from "../../messages/es/team.json";
import es_attendance from "../../messages/es/attendance.json";
import es_accounting from "../../messages/es/accounting.json";
import es_marketing from "../../messages/es/marketing.json";
import es_reservations from "../../messages/es/reservations.json";
import es_customers from "../../messages/es/customers.json";
import es_reports from "../../messages/es/reports.json";
import es_operations from "../../messages/es/operations.json";
import es_delivery from "../../messages/es/delivery.json";
import es_kiosk from "../../messages/es/kiosk.json";
import es_order from "../../messages/es/order.json";
import es_notifications from "../../messages/es/notifications.json";
import es_layout from "../../messages/es/layout.json";
import es_errors from "../../messages/es/errors.json";
import es_customerDisplay from "../../messages/es/customerDisplay.json";
import es_docs from "../../messages/es/docs.json";
import fr_common from "../../messages/fr/common.json";
import fr_nav from "../../messages/fr/nav.json";
import fr_auth from "../../messages/fr/auth.json";
import fr_dashboard from "../../messages/fr/dashboard.json";
import fr_pos from "../../messages/fr/pos.json";
import fr_orders from "../../messages/fr/orders.json";
import fr_tables from "../../messages/fr/tables.json";
import fr_kds from "../../messages/fr/kds.json";
import fr_menu from "../../messages/fr/menu.json";
import fr_inventory from "../../messages/fr/inventory.json";
import fr_settings from "../../messages/fr/settings.json";
import fr_team from "../../messages/fr/team.json";
import fr_attendance from "../../messages/fr/attendance.json";
import fr_accounting from "../../messages/fr/accounting.json";
import fr_marketing from "../../messages/fr/marketing.json";
import fr_reservations from "../../messages/fr/reservations.json";
import fr_customers from "../../messages/fr/customers.json";
import fr_reports from "../../messages/fr/reports.json";
import fr_operations from "../../messages/fr/operations.json";
import fr_delivery from "../../messages/fr/delivery.json";
import fr_kiosk from "../../messages/fr/kiosk.json";
import fr_order from "../../messages/fr/order.json";
import fr_notifications from "../../messages/fr/notifications.json";
import fr_layout from "../../messages/fr/layout.json";
import fr_errors from "../../messages/fr/errors.json";
import fr_customerDisplay from "../../messages/fr/customerDisplay.json";
import fr_docs from "../../messages/fr/docs.json";

export const NAMESPACES = ["common", "nav", "auth", "dashboard", "pos", "orders", "tables", "kds", "menu", "inventory", "settings", "team", "attendance", "accounting", "marketing", "reservations", "customers", "reports", "operations", "delivery", "kiosk", "order", "notifications", "layout", "errors", "customerDisplay", "docs"] as const;

type Flat = Record<string, string>;

function flatten(files: Record<string, Flat>): Flat {
  const out: Flat = {};
  for (const [ns, entries] of Object.entries(files)) {
    for (const [key, value] of Object.entries(entries)) out[`${ns}.${key}`] = value;
  }
  return out;
}

export const MESSAGES = {
  en: flatten({
    common: en_common,
    nav: en_nav,
    auth: en_auth,
    dashboard: en_dashboard,
    pos: en_pos,
    orders: en_orders,
    tables: en_tables,
    kds: en_kds,
    menu: en_menu,
    inventory: en_inventory,
    settings: en_settings,
    team: en_team,
    attendance: en_attendance,
    accounting: en_accounting,
    marketing: en_marketing,
    reservations: en_reservations,
    customers: en_customers,
    reports: en_reports,
    operations: en_operations,
    delivery: en_delivery,
    kiosk: en_kiosk,
    order: en_order,
    notifications: en_notifications,
    layout: en_layout,
    errors: en_errors,
    customerDisplay: en_customerDisplay,
    docs: en_docs,
  }),
  ar: flatten({
    common: ar_common,
    nav: ar_nav,
    auth: ar_auth,
    dashboard: ar_dashboard,
    pos: ar_pos,
    orders: ar_orders,
    tables: ar_tables,
    kds: ar_kds,
    menu: ar_menu,
    inventory: ar_inventory,
    settings: ar_settings,
    team: ar_team,
    attendance: ar_attendance,
    accounting: ar_accounting,
    marketing: ar_marketing,
    reservations: ar_reservations,
    customers: ar_customers,
    reports: ar_reports,
    operations: ar_operations,
    delivery: ar_delivery,
    kiosk: ar_kiosk,
    order: ar_order,
    notifications: ar_notifications,
    layout: ar_layout,
    errors: ar_errors,
    customerDisplay: ar_customerDisplay,
    docs: ar_docs,
  }),
  es: flatten({
    common: es_common,
    nav: es_nav,
    auth: es_auth,
    dashboard: es_dashboard,
    pos: es_pos,
    orders: es_orders,
    tables: es_tables,
    kds: es_kds,
    menu: es_menu,
    inventory: es_inventory,
    settings: es_settings,
    team: es_team,
    attendance: es_attendance,
    accounting: es_accounting,
    marketing: es_marketing,
    reservations: es_reservations,
    customers: es_customers,
    reports: es_reports,
    operations: es_operations,
    delivery: es_delivery,
    kiosk: es_kiosk,
    order: es_order,
    notifications: es_notifications,
    layout: es_layout,
    errors: es_errors,
    customerDisplay: es_customerDisplay,
    docs: es_docs,
  }),
  fr: flatten({
    common: fr_common,
    nav: fr_nav,
    auth: fr_auth,
    dashboard: fr_dashboard,
    pos: fr_pos,
    orders: fr_orders,
    tables: fr_tables,
    kds: fr_kds,
    menu: fr_menu,
    inventory: fr_inventory,
    settings: fr_settings,
    team: fr_team,
    attendance: fr_attendance,
    accounting: fr_accounting,
    marketing: fr_marketing,
    reservations: fr_reservations,
    customers: fr_customers,
    reports: fr_reports,
    operations: fr_operations,
    delivery: fr_delivery,
    kiosk: fr_kiosk,
    order: fr_order,
    notifications: fr_notifications,
    layout: fr_layout,
    errors: fr_errors,
    customerDisplay: fr_customerDisplay,
    docs: fr_docs,
  }),
};
