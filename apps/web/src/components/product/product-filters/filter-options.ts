import { GENDERS, PRODUCT_SORTS, type ProductSort } from "@aurascenthaus/shared";
import { humanize } from "@/lib/format";

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  name: "Name",
};

export const SORT_OPTIONS = PRODUCT_SORTS.map((value) => ({ value, label: SORT_LABELS[value] }));

export const GENDER_OPTIONS = GENDERS.map((value) => ({ value, label: humanize(value) }));
