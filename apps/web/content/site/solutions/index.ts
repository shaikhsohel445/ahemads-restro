import { arabicRestaurantSoftware } from "./arabic-restaurant-software";
import { kitchenDisplaySystem } from "./kitchen-display-system";
import { multiBranchRestaurantManagement } from "./multi-branch-restaurant-management";
import { qrOrderingSystem } from "./qr-ordering-system";
import { restaurantBillingSoftware } from "./restaurant-billing-software";
import { restaurantManagementSoftware } from "./restaurant-management-software";
import { restaurantPosSoftware } from "./restaurant-pos-software";
import { restaurantSoftwareIndia } from "./restaurant-software-india";
import { restaurantSoftwareSaudiArabia } from "./restaurant-software-saudi-arabia";
import type { SolutionPage } from "./types";

// Registry of SEO landing pages. Each page module lives next to this file
// and is added here; routes, sitemap, hreflang and footer links all read
// from this list. Which page owns which search query is documented in
// docs/marketing/KEYWORD-MAP.md.
export const SOLUTIONS: SolutionPage[] = [
  restaurantManagementSoftware,
  restaurantPosSoftware,
  restaurantBillingSoftware,
  qrOrderingSystem,
  kitchenDisplaySystem,
  multiBranchRestaurantManagement,
  restaurantSoftwareSaudiArabia,
  restaurantSoftwareIndia,
  arabicRestaurantSoftware,
];

export function solutionBySlug(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}
