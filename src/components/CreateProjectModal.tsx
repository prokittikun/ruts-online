import {
  CreateProjectSchema,
  type ICreateProject,
} from "@/schemas/projects/createProject";
import {
  type IUpdateProject,
  UpdateProjectSchema,
} from "@/schemas/projects/updateProject";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ProjectStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ItemStructure from "./ItemStructure";
import { ControlledInput } from "./Controlled";
import ControlledSelect from "./ControlledSelect";
import ControlledInputNumber from "./ControlledInputNumber";
import ControlledDatePicker from "./ControlledDatePicker";
import { Plus } from "lucide-react";

interface Props {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  editingProjectId: string | null;
  setEditingProjectId: (projectId: string | null) => void;
}

function CreateProjectModal({
  opened,
  close,
  refetch,
  isEditMode,
  setIsEditMode,
  editingProjectId,
  setEditingProjectId,
}: Props) {
  const createProjectApi = api.project.createProject.useMutation();

  const updateProjectApi = api.project.updateProject.useMutation();
  const getProjectByIdApi = api.project.getProjectById.useMutation();

  const getProjectTypeApi = api.project.getProjectType.useQuery(undefined, {
    enabled: !!opened,
  });

  const getAllAreaApi = api.area.getAllArea.useQuery(undefined, {
    enabled: !!opened,
  });

  const projectTypeOptions = getProjectTypeApi.data?.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  const areaOptions = getAllAreaApi.data?.map((area) => ({
    label: area.name,
    value: area.id,
  }));
  const combinedSchema = CreateProjectSchema.merge(
    UpdateProjectSchema.partial(),
  );

  type ProjectFormData = ICreateProject & Partial<IUpdateProject>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(combinedSchema),
  });

  useEffect(() => {
    if (opened && !isEditMode) {
      reset();
    }
  }, [isEditMode, opened, reset]);

  const onSubmit = (data: ProjectFormData) => {
    try {
      console.log(data);

      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตโครงการ..." : "กำลังสร้างโครงการ...",
      );

      if (isEditMode && editingProjectId) {
        // Update operation
        const updateData: IUpdateProject = {
          ...data,
          id: editingProjectId, // Add the ID for update
        };

        updateProjectApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingProjectId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตโครงการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateProject = data;

        createProjectApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างโครงการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      }
    }
  };

  useEffect(() => {
    if (isEditMode && editingProjectId) {
      getProjectByIdApi.mutate(editingProjectId, {
        onSuccess: (data) => {
          if (data) {
            // Populate form with existing equipment data
            setValue("name", data.name);
            setValue("detail", data.detail);
            setValue("location", data.location ?? "");
            setValue("project_budget", data.project_budget);
            setValue("typeId", data.project_type.id);
            setValue("date_start_the_project", data.date_start_the_project!);
            setValue("date_end_the_project", data.date_end_the_project!);
          }
        },
      });
    }
  }, [isEditMode, editingProjectId]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={"70%"}
        title={isEditMode ? "แก้ไขโครงการ" : "เพิ่มโครงการ"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure title="ชื่อโครงการ" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อโครงการ"
              name="name"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="รายละเอียดโครงการ" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุรายละเอียดของโครงการ"
              name="detail"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="สถานที่จัดโครงการ" required mode="vertical">
            {/* <ControlledInput
                  // postfix="คน"
                  required
                  // type="string"
                  // title="ชื่อครุภัณฑ์"
                  placeholder="ระบุสถานที่จัดโครงการ"
                  name="location"
                  control={control}
                /> */}
            <ControlledSelect
              className="w-full"
              placeholder="เลือกสถานที่จัดโครงการ"
              option={areaOptions}
              // checkIconPosition="right"
              // searchable
              control={control}
              name="typeId"
            />
          </ItemStructure>
          <ItemStructure
            title="รายละเอียดสถานที่จัดโครงการ"
            required
            mode="vertical"
          >
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุรายละเอียดสถานที่จัดโครงการ"
              name="location"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="งบประมาณโครงการ" required mode="vertical">
            <ControlledInputNumber
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุงบประมาณโครงการที่ต้องการ"
              name="project_budget"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="ประเภทโครงการ" required mode="vertical">
            {/* <Select
                  placeholder="เลือกประเภทโครงการ"
                  data={projectTypeOptions}
                /> */}
            <ControlledSelect
              className="w-full"
              placeholder="เลือกประเภทโครงการ"
              option={projectTypeOptions}
              // checkIconPosition="right"
              // searchable
              control={control}
              name="typeId"
            />
            {/* <ControlledInputNumber
                  // postfix="คน"
                  required
                  // type="string"
                  // title="ชื่อครุภัณฑ์"
                  placeholder="เลือกประเภทโครงการ"
                  name="typeId"
                  control={control}
                /> */}
          </ItemStructure>
          <ItemStructure
            title="วันเดือนปีที่เริ่มโครงการ"
            required
            mode="vertical"
          >
            <ControlledDatePicker
              placeholder="กรุณาเลือกวันเดือนปีที่เริ่มโครงการ"
              name="date_start_the_project"
              control={control}
            />
          </ItemStructure>
          <ItemStructure
            title="วันเดือนปีที่สิ้นสุดโครงการ"
            required
            mode="vertical"
          >
            <ControlledDatePicker
              placeholder="กรุณาเลือกวันเดือนปีที่สิ้นสุดโครงการ"
              name="date_end_the_project"
              control={control}
            />
          </ItemStructure>
         
          <Button color="blue" leftSection={<Plus />} type="submit">
            บันทึก
          </Button>
        </form>
      </Modal>
    </>
  );
}

export default CreateProjectModal;
