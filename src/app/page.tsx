import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function Home() {
  return (
    <div className="flex items-center justify-center h-[75vh] w-full ">
      <LoginForm />
    </div>
  );
}
