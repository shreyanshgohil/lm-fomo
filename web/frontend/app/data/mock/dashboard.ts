import type { ActivityItem, QuickAction, StatMetric } from "../../types";

export const dashboardStats: StatMetric[] = [
  {
    id: "active-widgets",
    label: "Active Widgets",
    value: "3",
    trend: "+1 this week",
    tone: "success",
  },
  {
    id: "products-tracked",
    label: "Products Tracked",
    value: "128",
    trend: "12 new",
    tone: "info",
  },
  {
    id: "total-impressions",
    label: "Total Impressions",
    value: "24.8K",
    trend: "+18% vs last week",
    tone: "success",
  },
  {
    id: "fomo-status",
    label: "FOMO Status",
    value: "Live",
    trend: "All widgets active",
    tone: "success",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Widget enabled on product page",
    description: "Classic Tee — storefront widget is now visible",
    timestamp: "2 hours ago",
    status: "success",
  },
  {
    id: "2",
    title: "Impression milestone",
    description: "Crossed 20,000 impressions this month",
    timestamp: "Yesterday",
    status: "info",
  },
  {
    id: "3",
    title: "Display mode updated",
    description: "Switched FOMO display to hybrid randomized",
    timestamp: "2 days ago",
    status: "warning",
  },
  {
    id: "4",
    title: "Widget copy saved",
    description: "Updated notification message for all active widgets",
    timestamp: "3 days ago",
    status: "success",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "configure",
    label: "Configure widget",
    description: "Adjust copy, colors, and display mode",
    primary: true,
  },
];
