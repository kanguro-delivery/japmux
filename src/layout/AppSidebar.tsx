"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useProjects } from "../context/ProjectContext";
import { useTenantAdmin } from "@/hooks/useTenantAdmin";
import { useAuth } from "@/context/AuthContext";
import TableIcon from "../icons/table.svg";
import UserCircleIcon from "../icons/user-circle.svg";
import BoltIcon from "../icons/bolt.svg";
import FolderIcon from "../icons/folder.svg";
import TaskIcon from "../icons/task.svg";
import PaperPlaneIcon from "../icons/paper-plane.svg";
import BoxCubeIcon from "../icons/box-cube.svg";
import ListIcon from "../icons/list.svg";
import EyeIcon from "../icons/eye.svg";
import ChatIcon from "../icons/chat.svg";
import ShootingStarIcon from "../icons/shooting-star.svg";
import BuildingIcon from "../icons/box.svg";
import {
  BoltIcon as HeroBoltIcon,
  FolderIcon as HeroFolderIcon,
  UserCircleIcon as HeroUserCircleIcon,
  PaperAirplaneIcon as HeroPaperAirplaneIcon,
  ListBulletIcon as HeroListIcon,
  EyeIcon as HeroEyeIcon,
  ChatBubbleLeftRightIcon as HeroChatIcon,
  SparklesIcon as HeroSparklesIcon,
  AdjustmentsHorizontalIcon,
  BuildingOfficeIcon as HeroBuildingIcon,
  TableCellsIcon as HeroTableIcon,
  ClipboardDocumentCheckIcon as HeroTaskIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import SidebarNavItem from "./SidebarNavItem";
import { ExtendedUserProfileResponse } from "@/services/api";

// Define SubItem type
export interface SubItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  new?: boolean;
  pro?: boolean;
}

export interface NavItem {
  icon: React.ReactNode;
  name: string;
  path?: string;
  subItems?: SubItem[];
  pro?: boolean;
  new?: boolean;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { selectedProjectId } = useProjects();
  const { isTenantAdmin } = useTenantAdmin();
  const { user } = useAuth();
  const userRole = (user as ExtendedUserProfileResponse)?.role;

  // Define navItems based on user role
  const getNavItems = (): NavItem[] => {
    if (userRole === 'tenant_admin') {
      return [
        {
          icon: <UserCircleIcon className="h-5 w-5" />,
          name: "Control Center",
          path: "/management",
          subItems: [
            { icon: <BuildingIcon className="" />, name: "Tenants", path: "/tenants" },
          ],
        }
      ];
    } else if (userRole === 'admin') {
      return [
        {
          icon: <UserCircleIcon className="h-5 w-5" />,
          name: "Control Center",
          path: "/management",
          subItems: [
            { name: "Users", path: "/users", icon: <UserCircleIcon className="" /> },
            { icon: <FolderIcon className="" />, name: "Projects", path: "/projects" },
            { name: "API Keys", path: "/api-keys", icon: <LockClosedIcon className="h-5 w-5" /> },
          ],
        },
        {
          icon: <BoltIcon className="h-5 w-5" />,
          name: "Current Project",
          path: "/current-project",
          subItems: selectedProjectId ? [
            { name: "AI Models", path: "/ai-models", icon: <BoltIcon className="" /> },
            { name: "Environments", path: "/environments", icon: <TableIcon className="" /> },
            { name: "Regions", path: "/regions", icon: <ListIcon className="" /> },
            //{ name: "Cultural Data", path: "/cultural-data", icon: <EyeIcon className="" /> },
            { name: "Tags", path: "/tags", icon: <ChatIcon className="" /> }
          ] : [],
        },
        {
          icon: <TaskIcon className="h-5 w-5" />,
          name: "My Prompts",
          path: selectedProjectId ? `/projects/${selectedProjectId}/prompts` : undefined,
        },
        {
          icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />,
          name: "My Rules",
          path:  `/rules` ,
        },
        {
          icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />,
          name: "Analysis Plans",
          path:  `/analysis-plan` ,
        },
        {
          icon: <PaperPlaneIcon className="h-5 w-5" />,
          name: "Execute Prompt",
          path: "/serveprompt",
          new: true
        },
        {
          icon: <ShootingStarIcon className="h-5 w-5" />,
          name: "Magic Assistant",
          path: "/prompt-wizard",
          pro: true
        }
      ];
    }
    return [];
  };

  const navItems = getNavItems().filter(item => !(item.subItems && item.subItems.length === 0 && item.name === "Current Project"));

  // State for submenu toggle and height calculation
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Calculate the correct submenu index based on the current path
  const activeSubmenuIndexBasedOnPath = React.useMemo(() => {
    // Solo abrir el submenú si la ruta actual coincide exactamente con algún subítem
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      if (item.subItems?.some(subItem => subItem.path && pathname === subItem.path)) {
        return i;
      }
    }
    return -1;
  }, [pathname, navItems]);

  // Effect to synchronize the open submenu state with the calculated path index
  useEffect(() => {
    setOpenSubmenu(activeSubmenuIndexBasedOnPath);
  }, [activeSubmenuIndexBasedOnPath]);

  // Manual toggle handler
  const handleSubmenuToggle = (index: number) => {
    // Solo permitir toggle si el elemento tiene subítems
    if (navItems[index].subItems && navItems[index].subItems.length > 0) {
      setOpenSubmenu(prev => prev === index ? null : index);
    }
  };

  // useEffect para calcular altura del submenú
  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      const currentSubMenu = subMenuRefs.current[openSubmenu];
      if (currentSubMenu) {
        setTimeout(() => {
          setSubMenuHeight(prev => ({
            ...prev,
            [openSubmenu]: currentSubMenu.scrollHeight,
          }));
        }, 0);
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (itemsToRender: NavItem[]) => (
    <ul className="flex flex-col gap-1.5">
      {itemsToRender.map((nav, index) => (
        <SidebarNavItem
          key={`${nav.name}-${index}`}
          nav={nav}
          index={index}
          openSubmenu={openSubmenu}
          pathname={pathname}
          isExpanded={isExpanded}
          isHovered={isHovered}
          isMobileOpen={isMobileOpen}
          handleSubmenuToggle={handleSubmenuToggle}
          subMenuHeight={subMenuHeight}
          subMenuRefs={subMenuRefs}
        />
      ))}
    </ul>
  );

  // useEffect para cerrar explícitamente el submenú si se deselecciona el proyecto
  useEffect(() => {
    if (!selectedProjectId) {
      setOpenSubmenu(null);
    }
  }, [selectedProjectId]);

  return (
    <>
      {/* Enhanced Sidebar */}
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-6 left-0 h-screen transition-all duration-500 ease-in-out z-50 border-r
          ${isExpanded || isMobileOpen
            ? "w-[350px]"
            : isHovered
              ? "w-[350px]"
              : "w-[120px]"
          }
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:left-0
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-700/30`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/90 backdrop-blur-xl"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-200/10 dark:bg-brand-800/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/10 dark:bg-purple-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Logo Section */}
        <div className={`relative py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"} transition-all duration-300`}>
          <Link href="/dashboard" className="group relative">
            {isExpanded || isHovered || isMobileOpen ? (
              <div className="relative">
                <h1 className="dark:text-white text-2xl font-bold bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent group-hover:from-brand-600 group-hover:via-purple-600 group-hover:to-indigo-600 transition-all duration-500 animate-gradient-x">
                  japm.app
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-200/20 via-purple-200/20 to-indigo-200/20 dark:from-brand-800/10 dark:via-purple-800/10 dark:to-indigo-800/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            ) : (
              <div className="relative group">
                <div className="relative p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="/images/logo/logo-icon.svg"
                    alt="Logo"
                    width={28}
                    height={28}
                    className="transform transition-transform duration-300"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-200/30 to-purple-200/30 dark:from-brand-800/20 dark:to-purple-800/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="relative flex flex-col duration-300 ease-linear no-scrollbar flex-1">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                {/* Section divider */}
                <h2 className={`mb-6 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"} transition-all duration-300`}>
                  {isExpanded || isHovered || isMobileOpen ? (
                    <span className="relative">
                      Navigation
                      <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500/30 to-purple-500/30 rounded-full"></div>
                    </span>
                  ) : (
                    <div className="p-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                      <div className="w-4 h-4 flex flex-col justify-center items-center space-y-0.5">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </h2>
                {renderMenuItems(navItems)}
              </div>
            </div>
          </nav>

          {/* Bottom decorative element */}
          <div className="relative mt-auto mb-6">
            {(isExpanded || isHovered || isMobileOpen) && (
              <div className="p-4 bg-gradient-to-br from-brand-50/80 to-purple-50/80 dark:from-brand-950/40 dark:to-purple-950/40 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg animate-fade-in-up">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl shadow-lg">
                    <ShootingStarIcon className=" text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">AI-Powered</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to assist</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-200/20 to-purple-200/20 dark:from-brand-800/10 dark:to-purple-800/10 rounded-2xl"></div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced border effect */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gray-200/80 dark:via-gray-700/50 to-transparent"></div>
      </aside>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </>
  );
};

export default AppSidebar;
