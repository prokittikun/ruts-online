import { Role } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const urlRoleCanAccess: {
  startPath: string;
  role: Role[];
}[] = [
  {
    startPath: "/PERSONNEL",
    role: ["PERSONNEL"],
  },
  {
    startPath: "/ADMIN",
    role: ["ADMIN"],
  },
];

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    // const role = req.nextauth.token?.role;
    // if ()
    for (const url of urlRoleCanAccess) {
      if (req.nextUrl.pathname.startsWith(url.startPath)) {
        if (token?.role && url.role.includes(token.role)) {
          return NextResponse.next();
        } else {
          return NextResponse.redirect(
            new URL(
              `/error?error=${encodeURIComponent("คุณไม่มีสิทธิ์ในการเข้าถึง")}`,
              req.url,
            ),
          );
        }
      }
    }

    return NextResponse.redirect(new URL("/404", req.url));
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (token) {
          return true;
        }
        return false;
      },
    },
  },
);

export const config = {
  matcher: ["/ADMIN/:path*"],
};
