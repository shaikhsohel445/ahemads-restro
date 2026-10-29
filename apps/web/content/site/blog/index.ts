import { howQrOrderingWorksInRestaurants } from "./how-qr-ordering-works-in-restaurants";
import { howToChooseRestaurantManagementSoftware } from "./how-to-choose-restaurant-management-software";
import { restaurantTechnologySaudiArabia } from "./restaurant-technology-saudi-arabia";
import type { Article } from "./types";

// Published articles. Add a module next to this file and list it here; the
// blog index, article routes, sitemap and hreflang all read from this list.
// The editorial plan for upcoming articles is docs/marketing/EDITORIAL-PLAN.md.
export const ARTICLES: Article[] = [
  howToChooseRestaurantManagementSoftware,
  howQrOrderingWorksInRestaurants,
  restaurantTechnologySaudiArabia,
];

export function articleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
