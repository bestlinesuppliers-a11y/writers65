import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  Clock, 
  CheckCircle, 
  CreditCard,
  MessageSquare,
  Settings,
  PlusCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/client",
    icon: Home,
  },
  {
    title: "Place Order",
    url: "/client/place-order",
    icon: PlusCircle,
  },
  {
    title: "Active Orders",
    url: "/client/orders",
    icon: Clock,
  },
  {
    title: "Completed Orders",
    url: "/client/completed",
    icon: CheckCircle,
  },
  {
    title: "Payments",
    url: "/client/payments",
    icon: CreditCard,
  },
  {
    title: "Messages",
    url: "/client/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    url: "/client/profile",
    icon: Settings,
  },
];

export function ClientSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            Client Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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