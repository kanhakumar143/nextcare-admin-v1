import { PricingPlan, PricingPlanFeatures } from "@/types/pricing.types";

/**
 * Transform API features object into display-friendly features array
 * @param features - The features object from the API
 * @returns Array of feature strings for display
 */
export const transformFeatures = (features: PricingPlanFeatures): string[] => {
  const featureList: string[] = [];

  if (features.free_consultations) {
    featureList.push(`${features.free_consultations} Free Consultations`);
  }

  if (features.teleconsultation) {
    featureList.push("Teleconsultation Available");
  }

  if (features.priority_booking) {
    featureList.push("Priority Appointment Booking");
  }

  if (features.support) {
    featureList.push(`Support: ${features.support}`);
  }

  if (features.family_members) {
    featureList.push(`Family Members: ${features.family_members}`);
  }

  if (features.lab_discount_percent) {
    featureList.push(`${features.lab_discount_percent}% Lab Discount`);
  }

  if (features.health_reports_storage) {
    featureList.push("Health Reports Storage");
  }

  if (features.diet_consultation) {
    featureList.push("Diet Consultation");
  }

  if (features.annual_health_checkup) {
    featureList.push("Annual Health Checkup");
  }

  if (features.fitness_tracking_integration) {
    featureList.push("Fitness Tracking Integration");
  }

  return featureList;
};

/**
 * Determine if a plan should be marked as popular
 * @param plan - The pricing plan
 * @param index - The index of the plan in the array
 * @param totalPlans - Total number of plans
 * @returns Boolean indicating if the plan should be marked as popular
 */
export const isPopularPlan = (
  plan: PricingPlan,
  index: number,
  totalPlans: number
): boolean => {
  // Mark the middle plan as popular for 3 plans, or the second plan for other counts
  if (totalPlans === 3) {
    return index === 1;
  }
  // For other counts, mark the second plan as popular if there are at least 2 plans
  return totalPlans >= 2 && index === 1;
};

/**
 * Get appropriate button text based on plan position and popularity
 * @param plan - The pricing plan
 * @param index - The index of the plan in the array
 * @param totalPlans - Total number of plans
 * @returns Button text string
 */
export const getButtonText = (
  plan: PricingPlan,
  index: number,
  totalPlans: number
): string => {
  if (isPopularPlan(plan, index, totalPlans)) return "Most Popular";
  if (index === totalPlans - 1) return "Buy Now";
  return "Get Started";
};

/**
 * Get appropriate button styling based on plan position and popularity
 * @param plan - The pricing plan
 * @param index - The index of the plan in the array
 * @param totalPlans - Total number of plans
 * @returns CSS class string for button styling
 */
export const getButtonStyle = (
  plan: PricingPlan,
  index: number,
  totalPlans: number
): string => {
  if (isPopularPlan(plan, index, totalPlans)) {
    return "bg-primary text-white hover:bg-primary/90";
  }
  if (index === totalPlans - 1) {
    return "border-2 border-primary text-primary hover:bg-primary hover:text-white";
  }
  return "border-2 border-primary text-primary hover:bg-primary hover:text-white";
};

/**
 * Convert duration in days to human-readable text
 * @param durationDays - Number of days
 * @returns Human-readable duration string
 */
export const getDurationText = (durationDays: number): string => {
  if (durationDays >= 365) {
    const years = Math.round(durationDays / 365);
    return `/${years} year${years > 1 ? "s" : ""}`;
  }
  if (durationDays >= 30) {
    const months = Math.round(durationDays / 30);
    return `/${months} month${months > 1 ? "s" : ""}`;
  }
  return `/${durationDays} days`;
};

/**
 * Get plan description based on duration
 * @param durationDays - Number of days the plan covers
 * @returns Description string for the plan
 */
export const getPlanDescription = (durationDays: number): string => {
  if (durationDays >= 365) {
    return "Annual healthcare plan";
  }
  if (durationDays >= 90) {
    return "Quarterly healthcare plan";
  }
  if (durationDays >= 30) {
    return "Monthly healthcare plan";
  }
  return "Short-term healthcare plan";
};

/**
 * Format price string to ensure consistent display
 * @param price - Price string from API
 * @returns Formatted price string
 */
export const formatPrice = (price: string): string => {
  // Remove any existing currency symbols and clean the string
  const cleanPrice = price.replace(/[₹INR]/g, "").trim();

  // If it's just a number, add ₹ symbol
  if (/^\d+$/.test(cleanPrice)) {
    return `₹${cleanPrice}`;
  }

  // If it already has INR, replace with ₹
  if (price.includes("INR")) {
    return price.replace("INR", "₹");
  }

  // If it already has ₹, return as is
  if (price.includes("₹")) {
    return price;
  }

  // Default case: add ₹ at the beginning
  return `₹${price}`;
};

/**
 * Sort pricing plans by price (ascending)
 * @param plans - Array of pricing plans
 * @returns Sorted array of pricing plans
 */
export const sortPlansByPrice = (plans: PricingPlan[]): PricingPlan[] => {
  return [...plans].sort((a, b) => {
    const priceA = parseInt(a.price.replace(/[^\d]/g, ""));
    const priceB = parseInt(b.price.replace(/[^\d]/g, ""));
    return priceA - priceB;
  });
};

/**
 * Get the most feature-rich plan
 * @param plans - Array of pricing plans
 * @returns The plan with the most features
 */
export const getMostFeatureRichPlan = (
  plans: PricingPlan[]
): PricingPlan | null => {
  if (plans.length === 0) return null;

  return plans.reduce((mostFeatureRich, current) => {
    const currentFeatureCount = Object.keys(current.features).filter(
      (key) => current.features[key as keyof PricingPlanFeatures]
    ).length;

    const mostFeatureRichCount = Object.keys(mostFeatureRich.features).filter(
      (key) => mostFeatureRich.features[key as keyof PricingPlanFeatures]
    ).length;

    return currentFeatureCount > mostFeatureRichCount
      ? current
      : mostFeatureRich;
  });
};
