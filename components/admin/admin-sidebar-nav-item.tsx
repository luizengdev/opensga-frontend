"use client";

import {ChevronRight, type LucideIcon} from "lucide-react";
import Link from "next/link";
import {useEffect, useState} from "react";

import {Button} from "@/components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import type {AdminNavItem} from "@/lib/admin/nav";

const isPathActive = (pathname: string, href: string) => {
  return pathname === href || pathname.startsWith(`${href}/`);
};

interface AdminSidebarNavItemProps {
  item: AdminNavItem;
  pathname: string;
  icon: LucideIcon;
  childIcons: Record<string, LucideIcon>;
  fallbackIcon: LucideIcon;
  onNavigate: () => void;
}

export const AdminSidebarNavItem = ({
  item,
  pathname,
  icon: Icon,
  childIcons,
  fallbackIcon: FallbackIcon,
  onNavigate,
}: AdminSidebarNavItemProps) => {
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isChildActive = children.some((child) => isPathActive(pathname, child.href));
  const isActive = hasChildren ? isChildActive : isPathActive(pathname, item.href);
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  const itemClassName = (active: boolean) => {
    return `h-auto w-full justify-start gap-2.5 px-3 py-2 text-xs font-medium ${
      active
        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    }`;
  };

  if (!hasChildren) {
    return (
      <Button
        className={itemClassName(isActive)}
        nativeButton={false}
        onClick={onNavigate}
        render={<Link href={item.href} />}
        variant="ghost"
      >
        <Icon
          className={`size-4 shrink-0 stroke-[1.8] ${
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
          }`}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {isActive ? <ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/50" /> : null}
      </Button>
    );
  }

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger
        render={
          <Button
            aria-expanded={open}
            className={itemClassName(isActive)}
            type="button"
            variant="ghost"
          />
        }
      >
        <Icon
          className={`size-4 shrink-0 stroke-[1.8] ${
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
          }`}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={`size-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="mt-0.5 ml-4 space-y-0.5 border-l border-sidebar-border pl-2">
          {children.map((child) => {
            const ChildIcon = childIcons[child.href] ?? FallbackIcon;
            const childActive = isPathActive(pathname, child.href);

            return (
              <Button
                className={itemClassName(childActive)}
                key={child.href}
                nativeButton={false}
                onClick={onNavigate}
                render={<Link href={child.href} />}
                variant="ghost"
              >
                <ChildIcon
                  className={`size-3.5 shrink-0 stroke-[1.8] ${
                    childActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                  }`}
                />
                <span className="flex-1 truncate text-left">{child.label}</span>
              </Button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
