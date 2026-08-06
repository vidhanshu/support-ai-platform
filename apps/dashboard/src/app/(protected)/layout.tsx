import type { Metadata } from "next";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/dashboard/sidebar/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderCircle className="size-6 animate-spin" />
        </div>
      }
    >
      <AuthGuard>
        <SidebarProvider className="h-svh overflow-hidden">
          <AppSidebar />
          <SidebarInset className="min-h-0 overflow-hidden">
            <div className="flex shrink-0 items-center border-b px-3 py-2 md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </Suspense>
  );
}
