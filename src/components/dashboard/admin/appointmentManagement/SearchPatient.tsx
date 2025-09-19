"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Activity,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  searchAppointmentsByPatient,
  clearSearchResults,
  clearSearchError,
  fetchDoctors,
} from "@/store/slices/scheduleSlotsSlice";
import { toast } from "sonner";
import moment from "moment";
import DoctorScheduleView from "./DoctorScheduleView";
import SlotTransferModal from "./modals/SlotTransferModal";
import { updateAppointmentBySlots } from "@/services/appointmentManagement.api";

// DND Kit imports
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export default function SearchPatient() {
  const dispatch = useAppDispatch();
  const { searchResults, isSearchingAppointments, searchError, doctors } =
    useAppSelector((state) => state.scheduleSlots);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Split screen state
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDoctorForShift, setSelectedDoctorForShift] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Drag and drop state
  const [activeSlot, setActiveSlot] = useState<any>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Clear search results when component unmounts or search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      dispatch(clearSearchResults());
    }
  }, [searchQuery, dispatch]);

  // Fetch doctors for shift appointment functionality
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Handle search error
  useEffect(() => {
    if (searchError) {
      toast.error(searchError);
      dispatch(clearSearchError());
    }
  }, [searchError, dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      toast.error("Please enter a patient name to search");
      return;
    }

    dispatch(
      searchAppointmentsByPatient({
        name: searchQuery.trim(),
        date: moment(selectedDate).format("YYYY-MM-DD"),
      })
    );
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(clearSearchResults());
  };

  const formatDateTime = (dateTimeString: string) => {
    return moment(dateTimeString).format("MMM DD, YYYY at HH:mm");
  };

  const formatTime = (dateTimeString: string) => {
    return moment(dateTimeString).format("HH:mm");
  };

  const isUpcoming = (dateTimeString: string) => {
    return moment(dateTimeString).isAfter(moment());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "fulfilled":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    return moment().diff(moment(dateOfBirth), "years");
  };

  // Draggable Slot Component for the current appointment (styled like DoctorScheduleView slots)
  const DraggableCurrentSlot = ({ appointment }: { appointment: any }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: `current-appointment-${appointment.appointment_display_id}`,
        data: {
          appointment,
          type: "current-appointment",
        },
      });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

    const formatTime = (dateTimeString: string) => {
      return moment(dateTimeString).format("HH:mm");
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          p-3 rounded-lg border-2 transition-all duration-200 flex flex-col justify-between w-full
          bg-red-50 border-red-200 text-red-800 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500
          ${isDragging ? "opacity-50 scale-95 rotate-2" : ""}
          transform hover:scale-[1.02]
        `}
        title="Drag to transfer appointment"
        role="button"
        tabIndex={0}
        aria-label={`Occupied appointment slot from ${formatTime(
          appointment.slot_info.start
        )} to ${formatTime(
          appointment.slot_info.end
        )}. Press space or enter to drag.`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {formatTime(appointment.slot_info.start)} -{" "}
              {formatTime(appointment.slot_info.end)}
            </span>
            <span className="text-xs opacity-75 font-medium">
              🔴 Current Appointment
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {isDragging && <span className="text-xs">📤</span>}
          </div>
        </div>
        <div className="text-xs mt-1 opacity-75 truncate border-t pt-1">
          <strong>{appointment.patient.user.name}</strong> -{" "}
          {appointment.appointment_display_id}
        </div>
      </div>
    );
  };

  // Split screen handlers
  const handleShiftAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSplitScreenMode(true);

    // Auto-select the current doctor by default for easier time slot changes
    const currentDoctorId =
      appointment.doctor?.id || appointment.practitioner_id;
    const currentDoctorName =
      appointment.doctor?.name || appointment.practitioner?.name;

    if (currentDoctorId && currentDoctorName) {
      // Find the doctor in our doctors list
      const foundDoctor = doctors.find((d) => d.id === currentDoctorId);
      if (foundDoctor) {
        setSelectedDoctorForShift({
          id: foundDoctor.id,
          name: foundDoctor.name,
        });
      } else {
        // If current doctor not found in list, clear selection to show all available doctors
        setSelectedDoctorForShift(null);
      }
    } else {
      // No current doctor info, show all available doctors
      setSelectedDoctorForShift(null);
    }
  };

  const handleCloseSplitScreen = () => {
    setSplitScreenMode(false);
    setSelectedAppointment(null);
    setSelectedDoctorForShift(null);
  };

  const handleDoctorSelection = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctorForShift({ id: doctor.id, name: doctor.name });
    }
  };

  const handleAppointmentTransfer = (
    appointmentId: string,
    newSlotId: string
  ) => {
    // This function will be called by the modal after API success
    // Close split screen after successful transfer
    setTimeout(() => {
      handleCloseSplitScreen();
    }, 1500);

    // Refresh search results to reflect changes
    if (searchQuery.trim()) {
      setTimeout(() => {
        dispatch(
          searchAppointmentsByPatient({
            name: searchQuery.trim(),
            date: moment(selectedDate).format("YYYY-MM-DD"),
          })
        );
      }, 2000);
    }
  };

  // Modal handlers
  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
    setTransferData(null);
  };

  const handleTransferConfirm = () => {
    if (!transferData) return;

    // The modal will handle the API call, we just need to handle the local state
    handleAppointmentTransfer(
      transferData.appointmentId,
      transferData.targetSlotId
    );
  };

  const handleRefreshData = async () => {
    // Refresh search results after transfer
    if (searchQuery.trim()) {
      dispatch(
        searchAppointmentsByPatient({
          name: searchQuery.trim(),
          date: moment(selectedDate).format("YYYY-MM-DD"),
        })
      );
    }
  };

  // DND Kit event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "current-appointment") {
      setActiveSlot(active.data.current.appointment);
      setDraggedAppointment(active.data.current.appointment);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSlot(null);
    setDraggedAppointment(null);

    if (!over) return;

    // Check if we're dropping on a valid doctor schedule slot
    const overIdString = over.id.toString();
    console.log("Drop target ID:", overIdString); // Debug log
    console.log("Drop target data:", over.data.current); // Debug log

    // Get the actual slot data from the drop target
    const targetSlotData = over.data.current;

    if (!targetSlotData || targetSlotData.type !== "droppable-slot") {
      console.log("Invalid drop target - not a droppable slot");
      toast.error("Please drop on a valid appointment slot");
      return;
    }

    // Extract the actual slot and schedule data
    const {
      slot: targetSlot,
      scheduleId: targetScheduleId,
      doctorId: targetDoctorId,
      scheduleDate,
    } = targetSlotData;

    if (active.data.current?.type === "current-appointment") {
      const appointment = active.data.current.appointment;
      console.log(
        "Preparing transfer for appointment:",
        appointment.appointment_display_id,
        "to slot:",
        targetSlot.id
      );
      console.log("Target slot data:", targetSlot); // Debug log
      console.log("Target schedule date:", scheduleDate); // Debug log

      // Now we have the actual target slot data
      const targetSlotForModal = {
        id: targetSlot.id,
        start: targetSlot.start,
        end: targetSlot.end,
        comment: targetSlot.comment || "",
        overbooked: targetSlot.overbooked,
      };

      // Use the actual schedule planning_start date
      const targetSchedule = {
        id: targetScheduleId,
        planning_start: scheduleDate || targetSlot.start, // Use scheduleDate if available, fallback to slot start
      };

      const sourceSlot = {
        id: appointment.id || appointment.appointment_display_id,
        start: appointment.slot_info.start,
        end: appointment.slot_info.end,
        comment: `Appointment: ${appointment.appointment_display_id} - Patient: ${appointment.patient.user.name}`,
        overbooked: true,
      };

      const sourceSchedule = {
        id: appointment.schedule_id || "unknown",
        planning_start: appointment.slot_info.start,
      };

      // Find target doctor name
      const targetDoctor = doctors.find((d) => d.id === targetDoctorId);
      const targetDoctorName =
        targetDoctor?.name || selectedDoctorForShift?.name;

      // Prepare transfer data for modal
      setTransferData({
        sourceSlot,
        targetSlot: targetSlotForModal,
        sourceSchedule,
        targetSchedule,
        sourceDoctorName:
          appointment.doctor?.name || appointment.practitioner?.name,
        targetDoctorName: targetDoctorName,
        appointmentId: appointment.id,
        targetSlotId: targetSlot.id,
      });

      setIsTransferModalOpen(true);
    } else {
      toast.error("Please drag a valid appointment");
    }
  };

  return (
    <div className="space-y-6">
      {splitScreenMode ? (
        // Split Screen Layout with Drag and Drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Selected Appointment Details */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Shift Appointment
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseSplitScreen}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag the appointment slot below to a new time slot on the
                  right →
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {selectedAppointment && (
                  <div className="space-y-4">
                    {/* Draggable Current Appointment Slot */}
                    <div className="space-y-2">
                      <h5 className="font-semibold flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        Current Appointment (Drag to Right Panel)
                      </h5>
                      <DraggableCurrentSlot appointment={selectedAppointment} />
                    </div>

                    {/* Current Appointment Info */}
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {getInitials(selectedAppointment.patient.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold">
                            {selectedAppointment.patient.user.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              selectedAppointment.status
                            )}
                          >
                            {selectedAppointment.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-red-700">
                              Current Slot:
                            </span>
                            <span className="font-bold text-red-800">
                              {formatTime(selectedAppointment.slot_info.start)}{" "}
                              - {formatTime(selectedAppointment.slot_info.end)}
                            </span>
                            <span className="text-red-600">
                              (
                              {moment(
                                selectedAppointment.slot_info.start
                              ).format("MMM DD, YYYY")}
                              )
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-red-700">
                              Current Doctor:
                            </span>
                            <span className="text-red-800">
                              {selectedAppointment.doctor?.name ||
                                selectedAppointment.practitioner?.name ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-red-700">
                              Appointment ID:
                            </span>
                            <span className="text-red-800">
                              {selectedAppointment.appointment_display_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Patient Contact Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Patient Contact Information
                      </h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{selectedAppointment.patient.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{selectedAppointment.patient.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span>
                            {calculateAge(
                              selectedAppointment.patient.birth_date
                            )}{" "}
                            years, {selectedAppointment.patient.gender}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span>
                            Patient ID:{" "}
                            {selectedAppointment.patient.patient_display_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Selection */}
                    <div className="space-y-3">
                      <h5 className="font-semibold flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        Select Doctor for New Appointment
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        Choose same doctor for time change, or different doctor
                        for doctor change
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-[55vh] overflow-y-auto">
                        {doctors.map((doctor) => (
                          <Button
                            key={doctor.id}
                            variant={
                              selectedDoctorForShift?.id === doctor.id
                                ? "default"
                                : "outline"
                            }
                            className="justify-start h-auto p-3"
                            onClick={() => handleDoctorSelection(doctor.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(doctor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {doctor.practitioner_display_id}
                                </div>
                                {/* Indicate if this is the current doctor */}
                                {(selectedAppointment.doctor?.id ===
                                  doctor.id ||
                                  selectedAppointment.practitioner_id ===
                                    doctor.id) && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Current Doctor
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Doctor Schedule */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="text-base">
                  {selectedDoctorForShift ? (
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {selectedDoctorForShift.name}'s Available Slots
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Doctor Schedule
                    </span>
                  )}
                </CardTitle>
                {selectedDoctorForShift && (
                  <p className="text-xs text-muted-foreground">
                    Drag the highlighted appointment to an available (green)
                    slot to shift it
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                {selectedDoctorForShift ? (
                  <DoctorScheduleView
                    doctorId={selectedDoctorForShift.id}
                    doctorName={selectedDoctorForShift.name}
                    selectedAppointmentId={
                      selectedAppointment?.appointment_display_id
                    }
                    onAppointmentTransfer={handleAppointmentTransfer}
                    className="h-full"
                    compactMode={true}
                    externalDndContext={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a doctor to view their schedule for appointment
                        transfer
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedAppointment && (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg">
                <div className="text-sm font-medium text-blue-600">
                  Moving Appointment
                </div>
                <div className="text-xs text-gray-600">
                  {draggedAppointment.patient?.user?.name ||
                    draggedAppointment.patient?.name ||
                    "Unknown Patient"}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // Normal Search View
        <>
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Patient Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Patient Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Enter patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Date
                    </label>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            moment(selectedDate).format("MMM DD, YYYY")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setIsCalendarOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Search Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearchingAppointments || !searchQuery.trim()}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    {isSearchingAppointments ? "Searching..." : "Search"}
                  </Button>
                  {(searchQuery || searchResults.length > 0) && (
                    <Button
                      variant="outline"
                      onClick={handleClearSearch}
                      className="flex items-center gap-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Search Results */}
                {isSearchingAppointments && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    Searching for appointments...
                  </div>
                )}

                {!isSearchingAppointments &&
                  searchResults.length === 0 &&
                  searchQuery && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No appointments found for "{searchQuery}" on{" "}
                        {moment(selectedDate).format("MMM DD, YYYY")}
                      </p>
                      <p className="text-sm mt-2">
                        Try searching with a different name or date.
                      </p>
                    </div>
                  )}

                {!isSearchingAppointments && searchResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Search Results ({searchResults.length} found)
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {moment(selectedDate).format("MMM DD, YYYY")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {searchResults.map((appointment) => (
                        <Card
                          key={appointment.id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col items-start justify-between">
                              <div className="flex items-start gap-4">
                                {/* Patient Avatar */}
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback>
                                    {getInitials(appointment.patient.user.name)}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Patient and Appointment Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold">
                                      {appointment.patient.user.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={getStatusColor(
                                        appointment.status
                                      )}
                                    >
                                      {appointment.status}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {/* Patient Details */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Patient ID:
                                        </span>
                                        <span>
                                          {
                                            appointment.patient
                                              .patient_display_id
                                          }
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">ID:</span>
                                        <span>
                                          {appointment.appointment_display_id}
                                        </span>
                                      </div>
                                      {/* <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Email:
                                        </span>
                                        <span>
                                          {appointment.patient.user.email}
                                        </span>
                                      </div> */}
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Phone:
                                        </span>
                                        <span>
                                          {appointment.patient.user.phone}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Age:
                                        </span>
                                        <span>
                                          {calculateAge(
                                            appointment.patient.birth_date
                                          )}{" "}
                                          years, {appointment.patient.gender}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Appointment Details */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Slot Booked:
                                        </span>
                                        <span className="font-bold text-lg text-blue-700">
                                          {formatTime(
                                            appointment.slot_info.start
                                          )}{" "}
                                          -{" "}
                                          {formatTime(
                                            appointment.slot_info.end
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                          Date:
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                          {moment(
                                            appointment.slot_info.start
                                          ).format("MMM DD, YYYY")}
                                        </span>
                                      </div>
                                      {appointment.service_specialty && (
                                        <div className="flex items-center gap-2">
                                          <Activity className="w-4 h-4 text-gray-500" />
                                          <span className="font-medium">
                                            Specialty:
                                          </span>
                                          <span>
                                            {
                                              appointment.service_specialty
                                                .specialty_label
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Shift Appointment Button */}
                              <div className="flex mt-4 w-full justify-end items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleShiftAppointment(appointment)
                                  }
                                  className="flex items-center gap-2 bg-white shadow-sm hover:bg-blue-50 border-blue-200"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    Shift Appointment
                                  </span>
                                  <span className="sm:hidden">Shift</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions when no search performed */}
          {!searchQuery && searchResults.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Search Patient Appointments
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a patient name and select a date to search for their
                    appointments. The search will show patient details along
                    with their appointment times and slot information.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Slot Transfer Confirmation Modal */}
      <SlotTransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferModalClose}
        transferData={transferData}
        onConfirm={handleTransferConfirm}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
}
