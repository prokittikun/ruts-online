import { z } from "zod";

export const downloadSchema = z.object({
  courseData: z.string(),
  major: z.string(),
  theme: z.string(),
});

export type DownloadInput = z.infer<typeof downloadSchema>;