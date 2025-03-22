import React, { useState } from "react";
import ItemStructure from "./ItemStructure";
import { toast } from "sonner";
import axios from "axios";

function UploadProjectFile() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFileSelect = async (selectedFiles: File | null) => {
    if (!selectedFiles) return;
    setFile(selectedFiles);
    setIsUploaded(true);
    // await handleFileUpload(selectedFiles);
  };

  const handleFileUpload = async (): Promise<void> => {
    try {
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      // formData.append("project_id", props.projectId!);
      const idToast = toast.loading("กำลังอัปโหลดไฟล์..");
      const response = await axios.post("/api/project_file_upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("อัปโหลดสำเร็จ", { id: idToast });
      } else {
        toast.error("อัปโหลดไม่สำเร็จ", { id: idToast });
      }
      // setIsUploaded(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <>
      <ItemStructure
        title="อัปโหลดแบบเสนอขออนุมัติโครงการ"
        required
        mode="vertical"
      >
        <input
          // ref={inputRef}
          type="file"
          className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
          // onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
      </ItemStructure>
      <ItemStructure
        title="อัปโหลดแบบเสนอขอเงินสนับสนุนโครงการ"
        required
        mode="vertical"
      >
        <input
          // ref={inputRef}
          type="file"
          className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
          // onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
      </ItemStructure>
    </>
  );
}

export default UploadProjectFile;
