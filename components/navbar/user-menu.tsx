"use client";

import {
  Dropdown,
  DropdownSection,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import NextLink from "next/link";
import { SignOutButton } from "./sign-out-button";
import { Session } from "next-auth";

import { Package2, Settings, LogOut, LayoutDashboard } from "lucide-react";

interface NavbarUserMenuProps {
  user: Session["user"];
}

export const NavbarUserMenu = ({ user }: NavbarUserMenuProps) => {
  const items = [
    // <DropdownItem key="profile" className="h-14 gap-2">
    //   <p className="font-semibold">Signed in as</p>
    //   <p className="font-semibold">{user.email}</p>
    // </DropdownItem>,
  ];

  if (user.role === "ADMIN") {
    items.push(
      <DropdownItem
        key="admin"
        as={NextLink}
        href="/admin"
      >
        dashboard
      </DropdownItem>
    );
  }

  if (user.role === "VENDOR" || user.role === "ADMIN") {
    items.push(
      <DropdownItem
        key="vendor"
        as={NextLink}
        href="/vendor"
        startContent={<LayoutDashboard size={16} />}
      >
        dashboard
      </DropdownItem>
    );
  }

  items.push(
    <DropdownItem key="orders" as={NextLink} startContent={<Package2 size={16} />} href="/orders" >
      my orders
    </DropdownItem>,
    <DropdownItem key="settings" as={NextLink} startContent={<Settings size={16} />} href="/settings">
      settings
    </DropdownItem>,
    <DropdownItem key="logout" color="danger" startContent={<LogOut size={16} />}>
      <SignOutButton />
    </DropdownItem>
  );

  return (
    <Dropdown placement="bottom-end" >
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="primary"
          name={user.name || "User"}
          size="sm"
          src={user.image || undefined}
        />
      </DropdownTrigger>

      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownSection>
          <DropdownItem key="info" showDivider isReadOnly>
            {user.email}
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          {items}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
