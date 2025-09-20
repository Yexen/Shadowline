'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { BatLogo } from '@/components/bat-logo';
import { Button } from '@/components/ui/button';
import {
  Home,
  PenSquare,
  Search,
  FileText,
  Images,
  Settings,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/editor', label: 'Editor', icon: PenSquare },
  { href: '/drafts', label: 'Drafts', icon: FileText },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center w-full p-2">
            <SidebarTrigger asChild>
              <div className="w-10 h-10 cursor-pointer">
                <BatLogo />
              </div>
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => router.push(item.href)}
                  isActive={pathname.startsWith(item.href)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-2 border-t border-sidebar-border">
            <div className="text-sm text-center">Shadowline</div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Shadowline</h1>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}