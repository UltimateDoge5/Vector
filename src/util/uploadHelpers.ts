import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { VectorFileRouter } from "~/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
	generateReactHelpers<VectorFileRouter>();