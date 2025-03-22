/* eslint-disable */
import fileUpload from "express-fileupload";
import { type NextApiRequest, type NextApiResponse } from "next";
import nc from "next-connect";
import path from "path";
import fs from "fs/promises";
import { getToken } from "next-auth/jwt";
import { db } from "@/server/db";

// Interface to properly type the files object from express-fileupload
export interface FileUploadRequest extends NextApiRequest {
  files: Record<string, fileUpload.UploadedFile>;
}

const handler = nc<FileUploadRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
}).use(fileUpload()).post(async (req, res) => {
  try {
    // Ensure that files are present
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }

    const uploadedFile = req.files.someFile as fileUpload.UploadedFile; // You can use your actual field name here
    if (!uploadedFile) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res.status(400).send("No file uploaded with the correct name.");
    }

    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uploadedFile.name); // Set the desired path

    // Save the file
    await fs.writeFile(uploadPath, uploadedFile.data);

    // Optionally, process the file or save info to DB
    // await db.saveFileInfo({ name: uploadedFile.name, path: uploadPath });

    res.status(200).send("File uploaded successfully.");
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
