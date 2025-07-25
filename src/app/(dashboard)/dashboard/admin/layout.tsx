import AdminSideBar from "@/components/dashboard/admin/AdminSideBar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="flex">
        <div className="w-1/8">
          <AdminSideBar />
        </div>
        <div className="flex-1 md:p-10 max-h-[90vh] ml-4 overflow-y-auto ">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
