export const PRIMARY_NAVIGATION = [
  "Overview",
  "Customers",
  "Estimates",
  "Projects",
  "Procurement",
  "Finance",
] as const;

export type PrimaryNavigationItem = (typeof PRIMARY_NAVIGATION)[number];

export const PROJECT_TABS = [
  "Overview",
  "Estimate",
  "Schedule",
  "Materials",
  "Purchase orders",
  "Costs",
  "Notes",
] as const;
