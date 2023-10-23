import { authMiddleware, clerkClient, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { UserType } from "./enums/UserType";

const adminPaths = ["/teachers", "/students*"];
 
const isAdminPath = (path: string) => {
  return adminPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default authMiddleware({
  publicRoutes: [],
  afterAuth(auth, req, evt) {

    if (!auth.userId && !auth.isPublicRoute) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if(isAdminPath(req.nextUrl.pathname)) {
        return clerkClient.users.getUser(auth.userId!)
        .then(user => {
          if(user.privateMetadata.role != UserType.ADMIN) {
            return NextResponse.redirect(new URL("/", req.url));
          }

          return NextResponse.next();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(() => redirectToSignIn({ returnBackUrl: req.url }));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
