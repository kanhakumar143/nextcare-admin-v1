"use client";

import React, { useState, useEffect } from "react";
import { getAllPricingPlansByTenant } from "@/services/receptionist.api";
// import { PricingPlan } from "@/types/pricing.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  transformFeatures,
  isPopularPlan,
  getButtonText,
  getButtonStyle,
  getDurationText,
  getPlanDescription,
  formatPrice,
  sortPlansByPrice,
} from "@/components/helper/pricingPlanHelper";
import { Check, Star, Clock, Shield, Users, Heart } from "lucide-react";

const ShowPlanPricingDetails: React.FC = () => {
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const response = await getAllPricingPlansByTenant();
        const sortedPlans = sortPlansByPrice(response);
        setPricingPlans(sortedPlans);
        setError(null);
      } catch (err) {
        setError("Failed to load pricing plans. Please try again.");
        console.error("Error fetching pricing plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("basic")) return <Shield className="w-6 h-6" />;
    if (name.includes("family")) return <Users className="w-6 h-6" />;
    if (name.includes("premium") || name.includes("wellness"))
      return <Heart className="w-6 h-6" />;
    return <Clock className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl border h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Plans
            </h3>
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Healthcare Plans
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect healthcare plan for your patients. All plans
            include essential medical services with varying levels of benefits
            and support.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pricingPlans.map((plan, index) => {
            const features = transformFeatures(plan.features);
            const isPopular = isPopularPlan(plan, index, pricingPlans.length);
            const buttonText = getButtonText(plan, index, pricingPlans.length);
            const durationText = getDurationText(plan.duration_days);
            const planDescription = getPlanDescription(plan.duration_days);
            const formattedPrice = formatPrice(plan.price);

            return (
              <div
                key={plan.id}
                className={`relative transition-transform duration-200 hover:scale-105`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-black text-white px-4 py-1 text-sm font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`h-full flex flex-col ${"border border-gray-200 bg-white hover:shadow-lg"} transition-all duration-200`}
                >
                  <CardHeader className="text-center pb-4">
                    {/* Plan Icon */}
                    <div className="flex justify-center mb-3">
                      <div
                        className={`p-3 rounded-full ${"bg-gray-100 text-gray-600"}`}
                      >
                        {getPlanIcon(plan.name)}
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>

                    <p className="text-sm text-gray-500 mb-4">
                      {planDescription}
                    </p>

                    {/* Price Display */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl md:text-4xl font-bold text-gray-900">
                          {formattedPrice.replace(/[₹]/g, "")}
                        </span>
                        <span className="text-xl text-gray-500 ml-1">₹</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {durationText}
                        </span>
                      </div>
                      <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Valid for {plan.duration_days} days
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 flex-1 flex flex-col">
                    {/* Features List */}
                    <div className="space-y-3 mb-6 flex-1">
                      {features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full font-semibold py-3 transition-all duration-200 bg-primary text-white hover:bg-primary/90"
                      size="lg"
                    >
                      {buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Additional Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Secure & Reliable
              </h3>
              <p className="text-sm text-gray-600">
                All plans include secure health data storage and HIPAA-compliant
                services.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Expert Support
              </h3>
              <p className="text-sm text-gray-600">
                Access to qualified healthcare professionals and customer
                support team.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Heart className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Comprehensive Care
              </h3>
              <p className="text-sm text-gray-600">
                Complete healthcare solutions from consultation to follow-up
                care.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            All prices are inclusive of applicable taxes. Plans can be upgraded
            or downgraded at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShowPlanPricingDetails;
