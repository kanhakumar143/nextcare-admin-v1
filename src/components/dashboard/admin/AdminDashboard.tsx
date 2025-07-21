"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const patientData = [
  { month: "Jan", active: 30, inactive: 10 },
  { month: "Feb", active: 45, inactive: 15 },
  { month: "Mar", active: 40, inactive: 20 },
  { month: "Apr", active: 50, inactive: 12 },
  { month: "May", active: 55, inactive: 14 },
];

const appointmentData = [
  { day: "Mon", checkedIn: 5, booked: 10, canceled: 2 },
  { day: "Tue", checkedIn: 12, booked: 15, canceled: 3 },
  { day: "Wed", checkedIn: 10, booked: 18, canceled: 1 },
  { day: "Thu", checkedIn: 8, booked: 14, canceled: 4 },
  { day: "Fri", checkedIn: 15, booked: 20, canceled: 2 },
];

export default function AdminDashboard() {
  return (
    <div className="flex n w-full overflow-y-hidden">
      <main className="flex-1 p-3 space-y-10  ">
        {/* Summary Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className=" rounded-xl p-4 shadow-sm">
            <h2 className="text-sm ">Total Patients</h2>
            <p className="text-2xl font-bold">1,200</p>
          </div>
          <div className=" rounded-xl p-4 shadow-sm">
            <h2 className="text-sm ">Appointments</h2>
            <p className="text-2xl font-bold">450</p>
          </div>
          <div className=" rounded-xl p-4 shadow-sm">
            <h2 className="text-sm 0">Doctors</h2>
            <p className="text-2xl font-bold">32</p>
          </div>
          <div className=" rounded-xl p-4 shadow-sm">
            <h2 className="text-sm ">Nurses</h2>
            <p className="text-2xl font-bold">18</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Chart (Line Chart) */}
          <div className=" p-4 rounded-xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Patients Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={patientData}>
                <CartesianGrid stroke="#ddd" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#111" // Dark black
                  strokeWidth={2}
                  name="Active"
                />
                <Line
                  type="monotone"
                  dataKey="inactive"
                  stroke="#3B82F6"
                  // strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Inactive"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Chart (Bar Chart) */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Appointment Stats</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentData}>
                <CartesianGrid stroke="#ddd" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkedIn" fill="#111827" name="Checked-In" />
                <Bar dataKey="booked" fill="#3B82F6" name="Booked" />
                <Bar dataKey="canceled" fill="#EF4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
