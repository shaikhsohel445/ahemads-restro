import {
  BarChart3,
  Banknote,
  Boxes,
  Building2,
  ChefHat,
  ClipboardList,
  Gift,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  MonitorSmartphone,
  QrCode,
  Receipt,
  ShoppingCart,
  UserCog,
  UsersRound,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { FeatureIcon as Key } from "@/content/site/home";

const ICONS: Record<Key, LucideIcon> = {
  dashboard: LayoutDashboard,
  pos: ShoppingCart,
  orders: ClipboardList,
  menu: UtensilsCrossed,
  tables: LayoutGrid,
  qr: QrCode,
  kds: ChefHat,
  billing: Receipt,
  offers: Gift,
  customers: UsersRound,
  staff: UserCog,
  reports: BarChart3,
  branches: Building2,
  realtime: Zap,
  language: Languages,
  currency: Banknote,
  inventory: Boxes,
  responsive: MonitorSmartphone,
};

export function FeatureIcon({ name, className }: { name: Key; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden />;
}
