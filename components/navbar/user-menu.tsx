"use client";

import {
  Dropdown,
  DropdownSection,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { SignOutButton } from "./sign-out-button";
import { Session } from "next-auth";

import { Package2, Settings, LogOut, LayoutDashboard } from "lucide-react";

interface NavbarUserMenuProps {
  user: Session["user"];
}

export const NavbarUserMenu = ({ user }: NavbarUserMenuProps) => {
  return (
    <Dropdown placement="bottom-end">
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
          {user.role === "ADMIN" ? (
            <DropdownItem
              key="admin"
              href="/admin"
              startContent={<LayoutDashboard size={16} />}
            >
              Admin Dashboard
            </DropdownItem>
          ) : null}
          {user.role === "VENDOR" || user.role === "ADMIN" ? (
            <DropdownItem
              key="vendor"
              href="/vendor"
              startContent={<LayoutDashboard size={16} />}
            >
              Vendor Dashboard
            </DropdownItem>
          ) : null}
          <DropdownItem
            key="orders"
            href="/orders"
            startContent={<Package2 size={16} />}
          >
            my orders
          </DropdownItem>
          <DropdownItem key="logout" color="danger" startContent={<LogOut size={16} />}>
            <SignOutButton />
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
