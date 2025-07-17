"use client";

import { Provider as StoreProvider } from "react-redux";
import store from "../store";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <StoreProvider store={store}>
      <>
        {children}
        <Toaster position="top-center" richColors />
      </>
    </StoreProvider>
  );
}
