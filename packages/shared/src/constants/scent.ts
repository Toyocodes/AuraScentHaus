export const GENDERS = ["MEN", "WOMEN", "UNISEX"] as const;
export type Gender = (typeof GENDERS)[number];

/** Common bottle sizes in ml. Variants may use other values. */
export const COMMON_SIZES_ML = [10, 30, 50, 75, 100, 150, 200] as const;
