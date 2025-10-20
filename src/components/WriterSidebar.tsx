import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  FileText,
  CheckCircle,
  DollarSign,
  MessageSquare,
  User,
  Search,
  Gavel,
} from "lucide-react";

const writerMenuItems = [
  {
    title: "Dashboard",
    url: "/writer",
    icon: BarChart3,
  },
  {
    title: "Available Orders",
    url: "/writer/orders",
    icon: Search,
  },
  {
    title: "My Bids",
    url: "/writer/bids",
    icon: Gavel,
  },
  {
    title: "My Assignments",
    url: "/writer/assignments",
    icon: FileText,
  },
  {
    title: "Submissions",
    url: "/writer/submissions",
    icon: CheckCircle,
  },
  {
    title: "Messages",
    url: "/writer/messages",
    icon: MessageSquare,
  },
  {
    title: "Earnings",
    url: "/writer/earnings",
    icon: DollarSign,
  },
  {
    title: "Profile",
    url: "/writer/profile",
    icon: User,
  },
];

export function WriterSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/writer") {
      return currentPath === "/writer";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-writer/10 text-writer font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-writer font-semibold">
            {state !== "collapsed" && "Writer Panel"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {writerMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/writer'}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}