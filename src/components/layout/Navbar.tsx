"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, LogOutIcon, UserCircle2 } from "lucide-react";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// Safe wrapper for SidebarTrigger that handles the hook context
function SafeSidebarTrigger() {
  try {
    return (
      <SidebarTrigger
        className="size-8 hover:bg-gray-100/80 md:hidden"
        title="Toggle Sidebar"
      />
    );
  } catch (error) {
    // Return null if useSidebar hook is not available
    return null;
  }
}

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuthInfo();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    // dispatch(deleteUserDetails());
    // dispatch(setUserDetails(null));
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 md:px-16 px-8  sm:px-8 pr-1 py-4 flex items-center justify-between backdrop-blur-md bg-white/60 border-b border-white/30 shadow-md text-black">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button - Only visible on mobile when sidebar context is available */}
        <SafeSidebarTrigger />

        <Link href="#" className="flex flex-col items-center ">
          <Image
            src="/mm.svg"
            alt="Logo"
            width={100}
            height={120}
            priority
            objectFit="cover"
          />
          <span className="text-xs text-gray-500">Powered by Nextcare</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:mr-0 mr-5">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOutIcon className="w-4 h-4 mr-1" /> Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
