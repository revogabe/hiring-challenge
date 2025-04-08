"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import MainLayout from "@/components/Layout";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>{children}</MainLayout>
    </QueryClientProvider>
  );
}
