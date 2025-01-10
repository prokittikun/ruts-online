import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import { SignInSchema } from "@/schemas/auth";
import { db } from "@/server/db";
import * as bcrypt from "bcrypt";
import Credentials from "next-auth/providers/credentials";
import { type Role } from "@prisma/client";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    exp: number;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      email: string;
      role: Role;
      firstName: string;
      lastName: string;

      // ...other properties
      // role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 days
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.name = `${token.firstName} ${token.lastName}`
      }

      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = `${user.firstName} ${user.lastName}`
      }

      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
    signOut: "/",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await SignInSchema.parseAsync(credentials);

          const user = await db.user.findFirst({
            where: {
              email: email,
              password: password,
            },
          });

          if (!user) {
            throw new Error("WRONG-CREDENTIAL");
          }

          return {
            id: user.id as string,
            email: user.email as string,
            firstName: user.first_name ?? "",
            lastName: user.last_name ?? "",
            role: user.role as Role,
          };
        } catch (err) {
          throw err;
        }
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
