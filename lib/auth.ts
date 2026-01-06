import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "@auth/core/errors";
import bcrypt from "bcryptjs";

class AccountDeactivatedError extends CredentialsSignin {
  code = "account_deactivated";
}

type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

// Cache duration for checking user active status (in milliseconds)
const STATUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    isActive?: boolean;
  }
}

// JWT token is extended via type assertions in the callbacks below
// This avoids module augmentation issues with different Auth.js versions

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { prisma } = await import("@/lib/prisma");

        if (!credentials?.email || !credentials?.password) {
          throw new Error("invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (user.isActive === false) {
          throw new AccountDeactivatedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: user.image,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign in, set up the token
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
        token.lastActiveCheck = Date.now();
      }

      // Periodically check if user is still active (every 5 minutes)
      const now = Date.now();
      const lastCheck = (token.lastActiveCheck as number) || 0;
      const shouldCheckStatus = now - lastCheck > STATUS_CHECK_INTERVAL;

      if (shouldCheckStatus && token.id) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true },
          });

          if (dbUser) {
            token.isActive = dbUser.isActive;
            token.lastActiveCheck = now;
          }
        } catch (error) {
          // If check fails, keep the previous status
          console.error("Error checking user active status:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
});

