"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginFormInputs, loginSchema } from "@/schemas/auth.schema";
import { generateAccessToken, loginUser } from "@/services/auth.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { storeLoginDetails } from "@/store/slices/authSlice";
import { fetchAssignedAppointments } from "@/store/slices/doctorSlice";
import { AppDispatch } from "@/store";

export default function LoginForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError("");
    console.log("Login data:", data);
    try {
      const res = await loginUser(data);
      const payload = {
        user_id: res.user_id,
        user_type: res?.user_role,
      };
      const response = await generateAccessToken(payload);
      toast.success("Login successful!");

      dispatch(
        storeLoginDetails({
          user_id: res.user_id,
          user_role: res?.user_role,
          access_token: response.access_token,
          org_id: res?.org_id,
          practitioner_id: res?.practitioner_id,
        })
      );
      console.log("Login response:", res.user_id);
      if (res?.user_role === "nurse") {
        return router.push("/dashboard/nurse");
      } else if (res?.user_role === "receptionist") {
        return router.push("/dashboard/receptionist");
      } else if (res?.user_role === "admin") {
        return router.push("/dashboard/admin");
      } else if (res?.user_role === "doctor") {
        return router.push("/dashboard/doctor/portal");
      } else {
        return toast.warning("User role not available");
      }
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
