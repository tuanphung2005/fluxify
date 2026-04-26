"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { useSession } from "next-auth/react";

import { NavbarUserMenu } from "./user-menu";
import { AuthButtons } from "./auth-buttons";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">fluxify</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={cn(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="" justify="end">
        {status === "loading" ? null : session?.user ? (
          <NavbarUserMenu user={session.user} />
        ) : (
          <AuthButtons />
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};
