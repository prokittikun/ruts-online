import React, { useState } from "react";
import ItemStructure from "./ItemStructure";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@mantine/core";

interface Props {
  setApprovalProjectFilePath: (path: string) => void;
  setSupportProjectFilePath: (path: string) => void;
}

function UploadProjectFile({
  setApprovalProjectFilePath,
  setSupportProjectFilePath,
}: Props) {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const handleFileSelect = (file: File | null, fileType: "file1" | "file2") => {
    if (!file) return;
    if (fileType === "file1") {
      setFile1(file);
    } else {
      setFile2(file);
    }
  };

  const handleFileUpload = async (file: File, fileName: string) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // Always use a consistent key name
    formData.append("fileName", fileName);
    try {
      const idToast = toast.loading(`กำลังอัปโหลด ${fileName}...`);
      const response = await axios.post<{
        message: string;
        file: {
          name: string;
          path: string;
        };
      }>("/api/project_file_upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        if (fileName === "แบบเสนอขออนุมัติโครงการ") {
          setApprovalProjectFilePath(`${response.data.file.path}`);
        }
        if (fileName === "แบบเสนอขอเงินสนับสนุนโครงการ") {
          setSupportProjectFilePath(`${response.data.file.path}`);
        }
        toast.success(`${fileName} อัปโหลดสำเร็จ!`, { id: idToast });
      } else {
        if (fileName === "แบบเสนอขออนุมัติโครงการ") {
          setApprovalProjectFilePath("");
        }
        if (fileName === "แบบเสนอขอเงินสนับสนุนโครงการ") {
          setSupportProjectFilePath("");
        }
        toast.error(`อัปโหลด ${fileName} ไม่สำเร็จ`, { id: idToast });
      }
    } catch (error) {
      if (fileName === "แบบเสนอขออนุมัติโครงการ") {
        setApprovalProjectFilePath("");
      }
      if (fileName === "แบบเสนอขอเงินสนับสนุนโครงการ") {
        setSupportProjectFilePath("");
      }
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    }
  };

  return (
    <>
      <div className="flex items-end gap-3">
        <ItemStructure
          title="อัปโหลดแบบเสนอขออนุมัติโครงการ"
          required
          mode="vertical"
        >
          <input
            type="file"
            className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
            accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
            onChange={(e) =>
              handleFileSelect(e.target.files?.[0] ?? null, "file1")
            }
          />
        </ItemStructure>
        {file1 && (
          <Button
            className="rounded bg-blue-500 p-2 text-white"
            onClick={() => handleFileUpload(file1, "แบบเสนอขออนุมัติโครงการ")}
          >
            อัปโหลดไฟล์นี้
          </Button>
        )}
      </div>
      <div className="flex items-end gap-3">
        <ItemStructure
          title="อัปโหลดแบบเสนอขอเงินสนับสนุนโครงการ"
          required
          mode="vertical"
        >
          <input
            type="file"
            className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
            accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
            onChange={(e) =>
              handleFileSelect(e.target.files?.[0] ?? null, "file2")
            }
          />
        </ItemStructure>
        {file2 && (
          <Button
            className="rounded bg-blue-500 p-2 text-white"
            onClick={() =>
              handleFileUpload(file2, "แบบเสนอขอเงินสนับสนุนโครงการ")
            }
          >
            อัปโหลดไฟล์นี้
          </Button>
        )}
      </div>
    </>
  );
}

export default UploadProjectFile;
