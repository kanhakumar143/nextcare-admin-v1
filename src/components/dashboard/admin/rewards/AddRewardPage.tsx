"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Gift, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addReward } from "@/store/slices/rewardSlice";
import {
  RewardTriggerTypeEnum,
  RewardPeriodEnum,
  CreateRewardRequest,
} from "@/types/reward.types";
import { ORG_TENANT_ID } from "@/config/authKeys";

// Form validation schema
const rewardRuleSchema = z.object({
  trigger_type: z.enum([
    RewardTriggerTypeEnum.ON_SIGNUP,
    RewardTriggerTypeEnum.ON_BOOKING,
    RewardTriggerTypeEnum.ON_PRESCRIPTION_UPLOAD,
    RewardTriggerTypeEnum.MANUAL,
    RewardTriggerTypeEnum.OTHER,
  ]),
  points: z.number().min(1, "Points must be at least 1"),
  period_interval: z.enum([
    RewardPeriodEnum.DAILY,
    RewardPeriodEnum.WEEKLY,
    RewardPeriodEnum.MONTHLY,
    RewardPeriodEnum.YEARLY,
    RewardPeriodEnum.OTHER,
  ]),
  max_per_period: z.number().min(1, "Max per period must be at least 1"),
  active: z.boolean(),
});

const rewardSchema = z.object({
  tenant_id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  active: z.boolean(),
  rules: z.array(rewardRuleSchema).min(1, "At least one rule is required"),
});

type RewardFormData = z.infer<typeof rewardSchema>;

export default function AddRewardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.reward);

  const form = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      tenant_id: ORG_TENANT_ID, // Default tenant ID
      name: "",
      description: "",
      active: true,
      rules: [
        {
          trigger_type: RewardTriggerTypeEnum.ON_SIGNUP,
          points: 50,
          period_interval: RewardPeriodEnum.DAILY,
          max_per_period: 1,
          active: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  const onSubmit = async (data: RewardFormData) => {
    try {
      const rewardData: CreateRewardRequest = {
        tenant_id: data.tenant_id,
        name: data.name,
        description: data.description,
        active: data.active,
        rules: data.rules,
      };

      await dispatch(addReward(rewardData)).unwrap();
      toast.success("Reward program created successfully!");
      router.push("/dashboard/admin/rewards");
    } catch (error: any) {
      toast.error(error || "Failed to create reward program");
    }
  };

  const addNewRule = () => {
    append({
      trigger_type: RewardTriggerTypeEnum.ON_BOOKING,
      points: 10,
      period_interval: RewardPeriodEnum.DAILY,
      max_per_period: 5,
      active: true,
    });
  };

  const getTriggerTypeLabel = (type: RewardTriggerTypeEnum) => {
    const labels = {
      [RewardTriggerTypeEnum.ON_SIGNUP]: "New Patient Signup",
      [RewardTriggerTypeEnum.ON_BOOKING]: "Appointment Booking",
      [RewardTriggerTypeEnum.ON_PRESCRIPTION_UPLOAD]: "Prescription Upload",
      [RewardTriggerTypeEnum.MANUAL]: "Manual Award",
      [RewardTriggerTypeEnum.OTHER]: "Other",
    };
    return labels[type];
  };

  const getPeriodLabel = (period: RewardPeriodEnum) => {
    const labels = {
      [RewardPeriodEnum.DAILY]: "Daily",
      [RewardPeriodEnum.WEEKLY]: "Weekly",
      [RewardPeriodEnum.MONTHLY]: "Monthly",
      [RewardPeriodEnum.YEARLY]: "Yearly",
      [RewardPeriodEnum.OTHER]: "Other",
    };
    return labels[period];
  };

  const handleCancel = () => {
    router.push("/dashboard/admin/rewards");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Gift className="w-8 h-8 text-primary" />
                Create New Reward Program
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a new reward program to incentivize patient engagement
                and loyalty
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., New Patient Rewards Program"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant ID *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the reward program and its benefits..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Program
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this reward program for patients
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Reward Rules */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Reward Rules</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewRule}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-2 border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Rule {index + 1}</Badge>
                          <FormField
                            control={form.control}
                            name={`rules.${index}.active`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm">
                                  Active
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`rules.${index}.trigger_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trigger Event *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select trigger event" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(RewardTriggerTypeEnum).map(
                                    (type) => (
                                      <SelectItem key={type} value={type}>
                                        {getTriggerTypeLabel(type)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rules.${index}.points`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Points Awarded *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="50"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rules.${index}.period_interval`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period Interval *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(RewardPeriodEnum).map(
                                    (period) => (
                                      <SelectItem key={period} value={period}>
                                        {getPeriodLabel(period)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rules.${index}.max_per_period`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Per Period *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Program
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
