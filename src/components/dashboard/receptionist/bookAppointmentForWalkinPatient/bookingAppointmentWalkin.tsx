"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Phone, Search } from "lucide-react";
import {
  checkPatientExistence,
  fetchUserDetails,
} from "@/services/receptionist.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCheckUserPhoneNumber } from "@/store/slices/authSlice";

const BookingAppointmentWalkin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userFound, setUserFound] = useState(false);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setPhoneNumber(value);
    setError("");
    setUserFound(false);
  };

  const handleCheckUser = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number");
      return;
    }

    if (phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await checkPatientExistence(phoneNumber);
      console.log("Check Patient Response:", response);
      if (response.exists) {
        // set user found state to true and render a component to book appointment
        getUserDetails(response.user_id);
      } else {
        dispatch(setCheckUserPhoneNumber(phoneNumber));
        router.push(
          `/dashboard/receptionist/book-appointment/register-patient`
        );
      }
    } catch (err) {
      setError("Failed to check user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async (user_id: string) => {
    try {
      const response = await fetchUserDetails(user_id);
      router.push(
        `/dashboard/receptionist/book-appointment/select-slot/${response.patient_profile.id}`
      );
      console.log("User Details:", response);
    } catch {
      toast.error("Failed to fetch user details.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckUser();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <h1 className="text-2xl font-bold text-primary text-center">
        Book Appointment for Walk-in Patient
      </h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Patient Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="Enter patient's phone number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onKeyPress={handleKeyPress}
              maxLength={15}
            />
          </div>

          <Button
            onClick={handleCheckUser}
            disabled={loading || !phoneNumber.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Checking...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check User
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {userFound && (
            <Alert className="border-green-200 bg-green-50">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-green-500 mr-2" />
                <AlertTitle className="text-green-800">
                  User found! You can proceed with booking.
                </AlertTitle>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Additional content can be added here when user is found */}
      {userFound && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>
                Patient details and appointment booking form will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingAppointmentWalkin;
