"use client";
import React from "react";
import { Nav } from "./nav";
import {
  ChevronRight,
  LayoutDashboard,
  MinusCircle,
  Pencil,
  PlusCircle,
  UsersRound,
  Landmark,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Button } from "./button";
import { useWindowWidth } from "@react-hook/window-size";

type Props = {};

export default function Sidebar({}: Props) {
  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 1068;
  
  const [isCollapsed, setIsCollapsed] = React.useState(mobileWidth);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    setIsCollapsed(mobileWidth);
  }, [mobileWidth]);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

 interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
}

const links: NavLink[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    variant: "default",
  },
  {
    title: "Users",
    href: "/users",
    icon: UsersRound,
    variant: "ghost",
  },
  {
    title: "Loans",
    href: "/loans",
    icon: Landmark,
    variant: "ghost",
  },
  {
    title: "Create User",
    href: "/create",
    icon: Pencil,
    variant: "ghost",
  },
  {
    title: "Deposit",
    href: "/deposit",
    icon: PlusCircle,
    variant: "ghost",
  },
  {
    title: "Withdraw",
    href: "/withdraw",
    icon: MinusCircle,
    variant: "ghost",
  },
];

  const SidebarHeader = () => (
    <div className="flex items-center grayscale gap-2 mb-4">
     
    </div>
  );

  return (
    <div 
      className={`relative border-r pb-10 pt-6 transition-all duration-300 ${
        isCollapsed ? 'min-w-[80px] px-3' : 'min-w-[200px] px-6'
      }`}
    >
      <SidebarHeader />
      {!mobileWidth && isMounted && (
        <div className="absolute right-[-20px] top-[50vh]">
          <Button
            variant="secondary"
            className="rounded-full p-2"
            onClick={toggleSidebar}
          >
            <ChevronRight
              className={`transform transition-transform duration-200 ${
                isCollapsed ? "rotate-0" : "rotate-180"
              }`}
            />
          </Button>
        </div>
      )}
      <Nav
        isCollapsed={!isMounted ? true : mobileWidth ? true : isCollapsed}
        links={links}
      />
    </div>
  );
}