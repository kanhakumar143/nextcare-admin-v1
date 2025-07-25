import AdminSideBar from "@/components/dashboard/admin/AdminSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Sidebar */}
        <div className="md:w-0 ">
          <AdminSideBar />
        </div>

        {/* Main content area */}
        <div className="w-full  overflow-y-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}
