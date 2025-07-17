import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full ">
      <LoginForm />
    </div>
  );
}
