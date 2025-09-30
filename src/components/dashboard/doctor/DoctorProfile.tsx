"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  Building2,
  IdCard,
  User,
  Stethoscope,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPractitionerDetails } from "@/store/slices/doctorSlice";

export default function DoctorProfile() {
  const dispatch = useAppDispatch();
  const {
    practitionerData,
    practitionerDataLoading: loading,
    practitionerDataError,
  } = useAppSelector((state) => state.doctor);
  const { userId } = useAuthInfo();
  const router = useRouter();

  useEffect(() => {
    if (userId && !practitionerData) {
      dispatch(fetchPractitionerDetails(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (practitionerDataError) {
      toast.error("Something went wrong! Please try again.");
    }
  }, [practitionerDataError]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!practitionerData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
        No practitioner data found.
      </div>
    );
  }

  const { user_data, practitioner_data } = practitionerData;

  const getFullName = () => {
    const { prefix, given, family } = practitioner_data?.name || {};
    return `${prefix?.[0] || ""} ${given?.join(" ") || ""} ${
      family || ""
    }`.trim();
  };

  const getWorkEmail = () =>
    practitioner_data.telecom.find(
      (t) => t.system === "email" && t.use === "work"
    )?.value || user_data.email;

  const getPhoneNumber = () =>
    practitioner_data.telecom.find((t) => t.system === "phone")?.value ||
    user_data.phone;

  const calculateAge = () => {
    if (!practitioner_data.birth_date) return "N/A";
    const birthDate = new Date(practitioner_data.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/doctor")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          size="sm"
          onClick={() => router.push("/dashboard/doctor/profile/edit")}
        >
          <Edit className="mr-3" /> Edit Profile
        </Button>
      </div>

      {/* Header */}
      <Card className="shadow-sm border">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={"/doctor-avatar.webp"}
              alt="Doctor Profile"
              width={96}
              height={96}
              className="rounded-full border shadow-sm object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {getFullName() || practitioner_data.user.name}
              </h1>
              {practitioner_data.qualification?.map((qual, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {qual.degree}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              ID: {practitioner_data.practitioner_display_id}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {getWorkEmail()}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />{" "}
                {getPhoneNumber() || "Not provided"}
              </div>
              <div className="flex items-center gap-1 capitalize">
                <User className="w-4 h-4" /> {practitioner_data.gender}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {calculateAge()} years
              </div>
            </div>
            {/* Additional Contact Details */}
            {practitioner_data.telecom?.filter((contact) => contact.rank !== 1)
              .length > 0 && (
              <div className="mt-1 flex gap-2">
                <Label>Additional Contact Details</Label>
                <div className="">
                  {practitioner_data.telecom
                    ?.filter((contact) => contact.rank !== 1)
                    ?.map((contact, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded"
                      >
                        {contact.system === "phone" ? (
                          <Phone className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        <span className="text-sm">{contact.value}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {contact.use || "primary"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Stethoscope className="w-5 h-5" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <Label>Medical License Number</Label>
              <p className="mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                {practitioner_data.license_details.number}
              </p>
            </div>
            <div>
              <Label>License Issued By</Label>
              <p className="mt-1">
                {practitioner_data.license_details.issued_by}
              </p>
            </div>
            <div>
              <Label>License Expiry</Label>
              <p className="mt-1">
                {new Date(
                  practitioner_data.license_details.expiry
                ).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Registration Identifiers</Label>
              <div className="mt-2 space-y-1">
                {practitioner_data.identifiers?.map((id, i) => (
                  <div key={i}>
                    <span className="font-medium">
                      {id.system.split("/").pop()}:
                    </span>{" "}
                    <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                      {id.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Award className="w-5 h-5" /> Education & Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {practitioner_data.qualification?.map((qual, i) => (
                <div key={i} className="bg-gray-50 rounded-md p-4">
                  <p className="font-semibold">{qual.degree}</p>
                  <p className="text-gray-600 text-sm">{qual.institution}</p>
                  <p className="text-gray-500 text-xs">
                    Graduated: {qual.year}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="w-5 h-5" /> Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-gray-50 p-4 rounded-md mx-4">
          <div>
            <div className="flex gap-3 items-center">
              <Label>Organization : </Label>
              <p className="font-medium">{user_data.tenant.name}</p>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {user_data.tenant.alias?.map((alias, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {alias}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Support Contact</Label>
            <div className="mt-3 space-y-1">
              {user_data.tenant.contact?.[0]?.telecom?.map((c, i) => (
                <div key={i} className="flex items-center gap-1 text-gray-700">
                  {c.system === "phone" ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {c.value}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
