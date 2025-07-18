import { headers } from "next/headers";
import { getServerDeviceType } from "@/lib/server-device";
import Navbar from "./Navbar";
import Image from "next/image";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const deviceType = await getServerDeviceType();
  const headersList = await headers();
  const pathname = headersList.get("referer");
  const isDashboardRoute = pathname?.includes("/");

  return (
    <>
      {isDashboardRoute && <Navbar deviceType={deviceType} />}

      <div className="flex flex-col min-h-screen relative bg-gradient-to-br bg-white">
        <div className="absolute inset-0 z-0 backdrop-blur-3xl bg-white/30" />

        <main
          className={`relative z-10 flex-1 md:px-16 px-0 sm:px-8 ${
            deviceType === "mobile" ? "mt-18 py-0" : "mt-14 py-10"
          }`}
        >
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
    </>
  );
}
