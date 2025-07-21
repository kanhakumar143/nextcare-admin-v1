import { AppSidebar } from "@/components/dashboard/admin/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({children,}:Readonly<{children:React.ReactNode;}>){
    return (
        <SidebarProvider>
        <div className="flex">
            <div className=" w-1/8 ">
                <AppSidebar/>
            </div>
            <div className="flex-1 md:p-10 max-h-[90vh] ml-4 overflow-y-auto ">
                {children}
            </div>
        </div>
        </SidebarProvider>
    )
}