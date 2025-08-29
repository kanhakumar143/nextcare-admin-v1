"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  LogIn,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  UserCheck,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { PractitionerAttendanceData } from "@/types/receptionist.types";

const AttendanceForPractitioner = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginLoading, setLoginLoading] = useState(false);
  // Get practitioner data from Redux store
  const practitionerData = useSelector(
    (state: RootState) => state.receptionistData.practitionerAttendanceData
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogin = () => {};

  if (!practitionerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading practitioner details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    user,
    name,
    qualification,
    license_details,
    availability_status,
    telecom,
  } = practitionerData;

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Time and Date */}
        <div className="text-center mb-8">
          <div className=" p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-medium">
                {formatDate(currentTime)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-black">
              <Clock className="h-6 w-6" />
              <span className="text-2xl font-bold font-mono">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Details Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className=" pb-2 grid grid-cols-2">
            <div className="flex flex-col items-start space-y-4">
              {/* Profile Picture */}
              <Avatar className="h-24 w-24 border-4 border-gray-300 shadow-lg">
                <AvatarImage
                  src={practitionerData.profile_picture_url || ""}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              {/* Name and Title */}
              <div className="flex flex-col items-start">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {name.prefix?.join(" ")} {user.name}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="text-sm bg-blue-100 text-blue-800"
                  >
                    Dr. {practitionerData.practitioner_display_id}
                  </Badge>
                  <Badge
                    variant={
                      practitionerData.is_active ? "default" : "destructive"
                    }
                    className={
                      practitionerData.is_active
                        ? "bg-green-500 text-white"
                        : ""
                    }
                  >
                    {practitionerData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-gray-600 capitalize">{user.user_role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Contact Information
              </h3>

              <div className="space-y-3">
                {/* Primary Phone */}
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Primary Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Additional Phone Numbers */}
                {telecom
                  ?.filter((t: any) => t.system === "phone")
                  ?.map((telecomItem: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 capitalize">
                          {telecomItem.use} Phone
                        </p>
                        <p className="font-medium">{telecomItem.value}</p>
                      </div>
                    </div>
                  ))}

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator className="mx-6" />

          <CardContent className="pt-6">
            <div className="text-center">
              <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <UserCheck className="h-12 w-12 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Mark Attendance
                    </h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Click the button below to log your attendance for today's
                      shift.
                    </p>
                    <Button
                      onClick={handleLogin}
                      disabled={loginLoading}
                      size="lg"
                      className="bg-black text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loginLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Logging In...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Log Attendance
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Availability Status Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900">
                  Current Status
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    availability_status.availability_status === "AVAILABLE"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    availability_status.availability_status === "AVAILABLE"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {availability_status.availability_status === "AVAILABLE"
                    ? "Available"
                    : "Unavailable"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Date: {availability_status.date}
                </span>
              </div>
              {availability_status.check_in_time && (
                <p className="text-sm text-gray-600 mt-2">
                  Check-in: {availability_status.check_in_time}
                </p>
              )}
              {availability_status.check_out_time && (
                <p className="text-sm text-gray-600">
                  Check-out: {availability_status.check_out_time}
                </p>
              )}
              {availability_status.total_hours && (
                <p className="text-sm text-gray-600">
                  Total Hours: {availability_status.total_hours}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Button at Bottom */}
      </div>
    </div>
  );
};

export default AttendanceForPractitioner;
