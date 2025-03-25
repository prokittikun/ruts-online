import fileUpload from "express-fileupload";
import { type NextApiRequest, type NextApiResponse } from "next";
import nc from "next-connect";
import path from "path";
import fs from "fs/promises";
import { getToken } from "next-auth/jwt";
import { db } from "@/server/db";

// Extend NextApiRequest to include files
export interface FileUploadRequest extends NextApiRequest {
  files: Record<string, fileUpload.UploadedFile>;
}

const handler = nc<FileUploadRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: "Page not found" });
  },
})
  .use(fileUpload())
  .post(async (req, res) => {
    try {
      // Authenticate user
      const token = await getToken({ req });
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Ensure a file is uploaded
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      // Get the uploaded file
      const uploadedFile = req.files.file!;
      if (!uploadedFile) {
        return res.status(400).json({ error: "Invalid file upload." });
      }
      const timestamp = new Date().getTime();
      // Get fileType from req.body (Next.js requires manually parsing FormData fields)
      const fileType =
        (req.body as { fileType?: string }).fileType ?? "unknown"; // Default if not provided
      const fileName = String(timestamp) + "-" + uploadedFile.name;
      // Define upload path
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const uploadPath = path.join(uploadDir, fileName);

      // Ensure the upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Save the file
      await fs.writeFile(uploadPath, uploadedFile.data);

      res.status(200).json({
        message: "File uploaded successfully.",
        file: {
          name: fileName,
          path: `/uploads/${fileName}`,
        },
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

export default handler;

export const config = {
  api: { bodyParser: false },
};
