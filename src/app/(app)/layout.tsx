import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Topbar />
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }} className="page-fade">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
