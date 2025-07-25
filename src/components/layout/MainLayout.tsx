"use client";
import Navbar from "./Navbar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import DynamicSidebar from "./DynamicSidebar";
import { useAuthInfo } from "@/hooks/useAuthInfo";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const { role } = useAuthInfo();

  const shouldShowSidebar = path !== "/" && role;

  return (
    <>
      {path !== "/" && <Navbar />}
      {shouldShowSidebar ? (
        <SidebarProvider>
          <div className="flex flex-col min-h-screen w-full relative bg-gradient-to-br bg-white">
            <div className="absolute inset-0 z-0 backdrop-blur-3xl bg-white/30" />

            {/* Main Content Area */}
            <div className="flex flex-1 relative z-10">
              {/* Sidebar */}
              <div className="flex-shrink-0">
                <DynamicSidebar />
              </div>

              {/* Content */}
              <main className="flex-1 md:px-8 px-4 mt-18 py-0 md:mt-14 md:py-10">
                {children}
              </main>
            </div>

            <footer className="relative z-10 bg-white flex justify-center py-2 items-center text-gray-500 text-sm border-t">
              <span className="flex items-center gap-2">
                Powered by
                <Image
                  src="/nextcare-logo.svg"
                  alt="Nextcare Logo"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </span>
            </footer>
          </div>
        </SidebarProvider>
      ) : (
        <div className="flex flex-col min-h-screen relative bg-gradient-to-br bg-white">
          <div className="absolute inset-0 z-0 backdrop-blur-3xl bg-white/30" />
          <main className="relative z-10 flex-1 md:px-16 px-0 sm:px-8 mt-18 py-0 md:mt-14 md:py-10">
            {children}
          </main>

          <footer className="relative z-10 flex justify-center py-2 items-center text-gray-500 text-sm border-t">
            <span className="flex items-center gap-2">
              Powered by
              <Image
                src="/nextcare-logo.svg"
                alt="Nextcare Logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </span>
          </footer>
        </div>
      )}
    </>
  );
}
