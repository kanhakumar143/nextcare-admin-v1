"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  MoreVertical,
  UserCheck,
  UserX,
  Coffee,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  Clock,
  Calendar,
  Timer,
  CheckCircle,
  XCircle,
  PauseCircle,
  RefreshCw,
  Users,
  TrendingUp,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { DoctorData, ExtendedDoctorData } from "@/types/admin.types";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setPractitionerAttendanceData,
  fetchPractitionersByRoleAsync,
} from "@/store/slices/receptionistSlice";
import {
  AttendanceStatus,
  PractitionerAttendanceData,
} from "@/types/receptionist.types";
import { RootState, AppDispatch } from "@/store";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  endBreakForDoctor,
  makeBreakForDoctor,
  makeCheckinForDoctor,
  makeCheckoutForDoctor,
} from "@/services/receptionist.api";

// Helper functions
const formatTime = (timeString: string | null) => {
  if (!timeString) return "N/A";
  try {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "N/A";
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatDuration = (hours: number) => {
  if (hours === 0) return "0h 0m";
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

const getAttendanceInfo = (doctor: DoctorData) => {
  const availabilityStatus = doctor.availability_status?.availability_status;
  const attendanceDetails = doctor.availability_status?.attendance_details;
  const breakDetails = doctor.availability_status?.break_details;

  return {
    status: availabilityStatus || "UNAVAILABLE",
    attendanceStatus: attendanceDetails?.status,
    checkInTime: doctor.availability_status?.check_in_time,
    checkOutTime: doctor.availability_status?.check_out_time,
    totalHours: doctor.availability_status?.total_hours || 0,
    breakType: breakDetails?.break_type,
    breakStartTime: breakDetails?.start_time,
    isOnBreak: availabilityStatus === "ON_BREAK",
    isPresent:
      availabilityStatus === "AVAILABLE" ||
      attendanceDetails?.status === "PRESENT",
    isAbsent:
      availabilityStatus === "UNAVAILABLE" ||
      attendanceDetails?.status === "CHECKED_OUT",
  };
};
interface AttendancePopoverProps {
  doctor: DoctorData;
  onAttendanceUpdate: (
    doctor: DoctorData,
    status: AttendanceStatus,
    breakType?: string | null
  ) => void;
}

// AttendancePopover component
interface AttendancePopoverProps {
  doctor: DoctorData;
  onAttendanceUpdate: (
    doctor: DoctorData,
    status: AttendanceStatus,
    breakType?: string | null
  ) => void;
}

function AttendancePopover({
  doctor,
  onAttendanceUpdate,
}: AttendancePopoverProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const attendanceInfo = getAttendanceInfo(doctor);

  const handleStatusChange = async (status: AttendanceStatus) => {
    setIsLoading(true);
    try {
      await onAttendanceUpdate(doctor, status);
      setOpen(false);
      setShowBreakOptions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreakTypeSelect = async (breakType: string) => {
    setIsLoading(true);
    try {
      await onAttendanceUpdate(doctor, "ON_BREAK", breakType);
      setOpen(false);
      setShowBreakOptions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setEndBreakForDoctor = async () => {
    setIsLoading(true);
    try {
      await endBreakForDoctor({
        practitioner_id: doctor.id,
        notes: "",
      });
      dispatch(fetchPractitionersByRoleAsync("doctor"));
      toast.success("Break ended successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to end break");
    } finally {
      setIsLoading(false);
    }
  };

  const breakTypes = [
    { value: "LUNCH", label: "Lunch Break", icon: "🍽️" },
    { value: "MEDICAL", label: "Medical Break", icon: "🏥" },
    { value: "PERSONAL", label: "Personal Break", icon: "👤" },
    { value: "EMERGENCY", label: "Emergency", icon: "🚨" },
    { value: "OTHER", label: "Other", icon: "📝" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <MoreVertical className="w-4 h-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <div className="space-y-2">
          {!showBreakOptions ? (
            <>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Attendance Actions
              </div>

              {!attendanceInfo.isPresent && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm hover:bg-green-50"
                  onClick={() => handleStatusChange("PRESENT")}
                  disabled={isLoading}
                >
                  <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                  Check In
                </Button>
              )}

              {attendanceInfo.isPresent && !attendanceInfo.isOnBreak && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm hover:bg-red-50"
                  onClick={() => handleStatusChange("ABSENT")}
                  disabled={isLoading}
                >
                  <UserX className="w-4 h-4 mr-2 text-red-600" />
                  Check Out
                </Button>
              )}

              {attendanceInfo.isOnBreak ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm hover:bg-orange-50"
                  onClick={() => setEndBreakForDoctor()}
                  disabled={isLoading}
                >
                  <Coffee className="w-4 h-4 mr-2 text-orange-600" />
                  End Break
                </Button>
              ) : (
                attendanceInfo.isPresent && (
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-9 px-3 text-sm hover:bg-yellow-50"
                    onClick={() => setShowBreakOptions(true)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center">
                      <Coffee className="w-4 h-4 mr-2 text-yellow-600" />
                      Start Break
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowBreakOptions(false)}
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  Select Break Type
                </span>
              </div>

              {breakTypes.map((breakType) => (
                <Button
                  key={breakType.value}
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm hover:bg-gray-50"
                  onClick={() => handleBreakTypeSelect(breakType.value)}
                  disabled={isLoading}
                >
                  <span className="mr-2">{breakType.icon}</span>
                  {breakType.label}
                </Button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function LogAttendance() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [filterValue, setFilterValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Get practitioners data from Redux store
  const { practitionersList, practitionersError } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const fetchPractitionerByRole = async () => {
    try {
      dispatch(fetchPractitionersByRoleAsync("doctor"));
    } catch (error) {
      console.error("Failed to fetch practitioners:", error);
    }
  };

  // Calculate attendance statistics
  const attendanceStats = practitionersList.reduce(
    (stats, doctor) => {
      const info = getAttendanceInfo(doctor);
      if (info.isPresent && !info.isOnBreak) {
        stats.present++;
      } else if (info.isOnBreak) {
        stats.onBreak++;
      } else {
        stats.absent++;
      }
      stats.total++;
      return stats;
    },
    { present: 0, absent: 0, onBreak: 0, total: 0 }
  );

  // Filter practitioners based on status
  const filteredPractitioners = practitionersList.filter((doctor) => {
    if (selectedStatus === "all") return true;
    const info = getAttendanceInfo(doctor);

    switch (selectedStatus) {
      case "present":
        return info.isPresent && !info.isOnBreak;
      case "absent":
        return info.isAbsent;
      case "break":
        return info.isOnBreak;
      default:
        return true;
    }
  });

  const handleAttendanceUpdate = async (
    doctor: DoctorData,
    status: AttendanceStatus,
    breakType?: string | null
  ) => {
    if (status === "PRESENT") {
      try {
        await makeCheckinForDoctor({
          practitioner_id: doctor.id,
          status,
        });
        fetchPractitionerByRole();
        toast.success("Doctor checked in successfully");
      } catch (error) {
        toast.error("Failed to check in doctor");
        console.error("Failed to update attendance:", error);
      }
    } else if (status === "ABSENT") {
      try {
        await makeCheckoutForDoctor({
          practitioner_id: doctor.id,
        });
        fetchPractitionerByRole();
        toast.success("Doctor checked out successfully");
      } catch (error) {
        toast.error("Failed to check out doctor");
        console.error("Failed to update attendance:", error);
      }
    } else if (status === "ON_BREAK") {
      try {
        await makeBreakForDoctor({
          practitioner_id: doctor.id,
          break_type: breakType || "OTHER",
          reason: "",
        });
        fetchPractitionerByRole();
        toast.success(`Break started - ${breakType || "Other"}`);
      } catch (error) {
        toast.error("Failed to start break");
        console.error("Failed to update attendance:", error);
      }
    }
  };

  useEffect(() => {
    fetchPractitionerByRole();
  }, []);

  const columns: ColumnDef<DoctorData>[] = [
    {
      header: "Doctor Information",
      cell: ({ row }) => {
        const doctor = row.original;

        // Helper function to get the name
        const getName = () => {
          if (doctor.user?.name && doctor.user.name.trim() !== "") {
            return doctor.user.name;
          }
          if (doctor.name) {
            const given = doctor.name.given?.[0] || "";
            const family = doctor.name.family || "";
            const fullName = `${given} ${family}`.trim();
            if (fullName !== "") {
              return fullName;
            }
          }
          return doctor.practitioner_display_id || "Unknown";
        };

        const getPrefix = () => {
          return doctor.name?.prefix?.[0] || "Dr.";
        };

        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {getName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {getPrefix()} {getName()}
              </div>
              <div className="text-sm text-gray-500">
                ID: {doctor.practitioner_display_id || "N/A"}
              </div>
              {doctor.user?.email && (
                <div className="text-xs text-gray-400">{doctor.user.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Current Status",
      cell: ({ row }) => {
        const doctor = row.original;
        const info = getAttendanceInfo(doctor);

        let statusElement;
        if (info.isPresent && !info.isOnBreak) {
          statusElement = (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Present
            </Badge>
          );
        } else if (info.isOnBreak) {
          statusElement = (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <PauseCircle className="w-3 h-3 mr-1" />
              On Break
            </Badge>
          );
        } else {
          statusElement = (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <XCircle className="w-3 h-3 mr-1" />
              Absent
            </Badge>
          );
        }

        return (
          <div className="space-y-1">
            {statusElement}
            {info.isOnBreak && info.breakType && (
              <div className="text-xs text-gray-500">
                {info.breakType.toLowerCase().replace("_", " ")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Today's Activity",
      cell: ({ row }) => {
        const doctor = row.original;
        const info = getAttendanceInfo(doctor);

        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-3 h-3 mr-1" />
              <span className="font-medium">Check-in:</span>
              <span className="ml-1">{formatTime(info.checkInTime)}</span>
            </div>

            {info.checkOutTime && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                <span className="font-medium">Check-out:</span>
                <span className="ml-1">{formatTime(info.checkOutTime)}</span>
              </div>
            )}

            {info.isOnBreak && info.breakStartTime && (
              <div className="flex items-center text-yellow-600">
                <Coffee className="w-3 h-3 mr-1" />
                <span className="font-medium">Break since:</span>
                <span className="ml-1">{formatTime(info.breakStartTime)}</span>
              </div>
            )}

            <div className="flex items-center text-blue-600">
              <Timer className="w-3 h-3 mr-1" />
              <span className="font-medium">Total:</span>
              <span className="ml-1">
                {formatDuration(Number(info.totalHours) || 0)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "License",
      cell: ({ row }) => {
        const licenseNumber = row.original.license_details?.number;
        const licenseExpiry = row.original.license_details?.expiry;

        return (
          <div className="text-sm">
            <div className="font-medium">
              {licenseNumber && licenseNumber.trim() !== ""
                ? licenseNumber
                : "N/A"}
            </div>
            {licenseExpiry && (
              <div className="text-xs text-gray-500">
                Exp: {formatDate(licenseExpiry)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex items-center gap-2">
            <AttendancePopover
              doctor={doctor}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor Attendance
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor doctor attendance for{" "}
            {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{attendanceStats.total}</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-lg font-bold text-green-600">
                {attendanceStats.present}
              </p>
              <p className="text-xs text-muted-foreground">
                {attendanceStats.total > 0
                  ? Math.round(
                      (attendanceStats.present / attendanceStats.total) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">On Break</p>
              <p className="text-lg font-bold text-yellow-600">
                {attendanceStats.onBreak}
              </p>
            </div>
            <PauseCircle className="h-4 w-4 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-lg font-bold text-red-600">
                {attendanceStats.absent}
              </p>
            </div>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter">Filter by status:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              <SelectItem value="present">Present Only</SelectItem>
              <SelectItem value="absent">Absent Only</SelectItem>
              <SelectItem value="break">On Break Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredPractitioners.length} of {attendanceStats.total}{" "}
          doctors
        </div>
      </div>

      {/* Error Handling */}
      {practitionersError && (
        <div className="flex justify-center py-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            Error: {practitionersError}
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable<DoctorData>
        columns={columns}
        data={filteredPractitioners}
        filterColumn="practitioner_display_id"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
