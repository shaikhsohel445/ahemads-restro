import {
  CalendarClock,
  Clock,
  Truck,
  Users,
  Landmark,
  BarChart3,
  Megaphone,
  Wrench,
  ChefHat,
  LayoutDashboard,
  ClipboardList,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type NavGroup = "service" | "manage" | "business" | "system";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  /** Sidebar section: front-of-house service first, back office after. */
  group: NavGroup;
}

export const NAV_GROUPS: NavGroup[] = ["service", "manage", "business", "system"];

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.sales.view", group: "service" },
  { labelKey: "nav.pos", href: "/pos", icon: ShoppingCart, permission: "orders.create", group: "service" },
  { labelKey: "nav.orders", href: "/orders", icon: ClipboardList, permission: "orders.create", group: "service" },
  { labelKey: "nav.tables", href: "/tables", icon: LayoutGrid, permission: "tables.view", group: "service" },
  {
    labelKey: "nav.reservations",
    href: "/reservations",
    icon: CalendarClock,
    permission: "reservations.manage",
    group: "service",
  },
  { labelKey: "nav.menu", href: "/menu", icon: UtensilsCrossed, permission: "menu.view", group: "manage" },
  { labelKey: "nav.kds", href: "/kds", icon: ChefHat, permission: "kds.manage", group: "service" },
  { labelKey: "nav.customers", href: "/customers", icon: UsersRound, permission: "customers.manage", group: "manage" },
  { labelKey: "nav.inventory", href: "/inventory", icon: Package, permission: "inventory.manage", group: "manage" },
  { labelKey: "nav.delivery", href: "/delivery", icon: Truck, permission: "delivery.manage", group: "manage" },
  { labelKey: "nav.team", href: "/team", icon: Users, permission: "staff.manage", group: "business" },
  { labelKey: "nav.accounting", href: "/accounting", icon: Landmark, permission: "accounting.manage", group: "business" },
  { labelKey: "nav.reports", href: "/reports", icon: BarChart3, permission: "reports.access", group: "business" },
  { labelKey: "nav.marketing", href: "/marketing", icon: Megaphone, permission: "marketing.manage", group: "business" },
  { labelKey: "nav.operations", href: "/operations", icon: Wrench, permission: "operations.manage", group: "business" },
  { labelKey: "nav.attendance", href: "/attendance", icon: Clock, group: "business" },
  { labelKey: "nav.settings", href: "/settings", icon: Settings, permission: "settings.manage", group: "system" },
];
