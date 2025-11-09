
"use client";

import Link from "next/link";
import {
  Home,
  Wrench,
  CircleDollarSign,
  Settings,
  User,
  ShieldQuestion,
  Leaf,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { isAdmin } from "@/app/actions";


const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/issues", icon: Wrench, label: "Issues" },
  { href: "/dashboard/funding", icon: CircleDollarSign, label: "Funding" },
  { href: "/dashboard/waste-report", icon: Leaf, label: "Waste Report" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const adminStatus = await isAdmin(currentUser.email);
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Mana Ooru Mana Badyatha</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        {userIsAdmin && (
            <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                <Link
                    href="/dashboard/support"
                    className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                        pathname === '/dashboard/support' && "bg-accent text-accent-foreground"
                    )}
                >
                    <ShieldQuestion className="h-5 w-5" />
                    <span className="sr-only">Support Settings</span>
                </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Support Settings</TooltipContent>
            </Tooltip>
            </TooltipProvider>
        )}
      </nav>
    </aside>
  );
}
