import { createNextRouteHandler } from "uploadthing/next";
import { vectorFileRouter } from "./core";

export const { GET, POST } = createNextRouteHandler({
	router: vectorFileRouter,
});