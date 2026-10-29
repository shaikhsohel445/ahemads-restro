import type { SiteLocale } from "@/lib/site/config";
import type { Block } from "../blog/types";

export interface LegalCopy {
  title: string;
  description: string;
  updated: string;
  body: Block[];
}

export type LegalDoc = Record<SiteLocale, LegalCopy>;
