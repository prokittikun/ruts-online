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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ControlledInput } from "./Controlled";
import ControlledDatePicker from "./ControlledDatePicker";
import ControlledInputNumber from "./ControlledInputNumber";
import ControlledMultiSelect from "./ControlledMultiSelect";
import ControlledSelect from "./ControlledSelect";
import ItemStructure from "./ItemStructure";
import UploadProjectFile from "./UploadProjectFile";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { YearPicker } from "@mantine/dates";

interface Props {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  editingProjectId: number | null;
  setEditingProjectId: (projectId: number | null) => void;
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
  const { data: session, status } = useSession();
  const [approvalProjectFilePath, setApprovalProjectFilePath] =
    useState<string>("");
  const [supportProjectFilePath, setSupportProjectFilePath] =
    useState<string>("");

  const createProjectApi = api.project.createProject.useMutation();

  const updateProjectApi = api.project.updateProject.useMutation();
  const getProjectByIdApi = api.project.getProjectById.useMutation();

  const getProjectTypeApi = api.project.getProjectType.useQuery(undefined, {
    enabled: !!opened,
  });

  const getAllAreaApi = api.area.getAllArea.useQuery(undefined, {
    enabled: !!opened,
  });

  const getAllPersonnelApi = api.personnel.getAllPersonnel.useQuery(
    {
      role: Role.PERSONNEL,
    },
    {
      enabled: !!opened,
    },
  );

  const getAllAgencyApi = api.agency.getAllAgency.useQuery(undefined, {
    enabled: !!opened,
  });

  const getAllIndicatorApi = api.indicator.getAllIndicator.useQuery(undefined, {
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

  const personnelOptions = getAllPersonnelApi.data?.map((person) => ({
    label: person.first_name + " " + person.last_name,
    value: person.id.toString(),
  }));

  const agencyOptions = getAllAgencyApi.data?.map((agency) => ({
    label: agency.name,
    value: agency.id,
  }));

  const indicatorOptions = getAllIndicatorApi.data?.map((indicator) => ({
    label: indicator.name,
    value: indicator.id,
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
  const approvalProjectFilePathWatch = watch("approvalProjectFilePath");

  useEffect(() => {
    if (approvalProjectFilePath) {
      setValue("approvalProjectFilePath", approvalProjectFilePath);
    }
  }, [approvalProjectFilePath, setValue]);

  // useEffect(() => {
  //   if (supportProjectFilePath) {
  //     setValue("supportProjectFilePath", supportProjectFilePath);
  //   }
  // }, [supportProjectFilePath, setValue]);

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
            setValue("project_budget", data.project_budget);
            setValue("typeId", data.project_type?.id ?? "");
            setValue("date_start_the_project", data.date_start_the_project!);
            setValue("date_end_the_project", data.date_end_the_project!);
            setValue(
              "personnelId",
              session?.user.role == Role.ADMIN
                ? data.personnelId!.toString()
                : session?.user.id!.toString(),
            );
            setValue("fiscal_year", data.fiscal_year!.toString());
            setValue("areaId", data.areaId!);
            setValue(
              "indicators",
              data.Assemble.map((item) => item.indicator.id) as [
                string,
                ...string[],
              ],
            );
            setValue(
              "participatingAgencies",
              data.Participating_agencies.map((item) => item.agency.id) as [
                string,
                ...string[],
              ],
            );
            setValue(
              "owners",
              data.Owner.map((item) => item.personnelId.toString()) as [
                string,
                ...string[],
              ],
            );
            setValue("approvalProjectFilePath", data.approvalProjectFilePath!);
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
          <ItemStructure
            title="ปีงบประมาณในการดำเนินโครงการ"
            required
            mode="vertical"
          >
            {/* <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุปีงบประมาณในการดำเนินโครงการ"
              name="fiscal_year"
              control={control}
            /> */}
            <YearPicker
              // value={year ? new Date(year) : null}
              value={
                watch("fiscal_year")
                  ? new Date(
                      parseInt(watch("fiscal_year")),
                      0,
                      1,
                    )
                  : null
              }
              onChange={(value) => {
                setValue(
                  "fiscal_year", value!.getFullYear().toString(),
                );
              }}
            />
          </ItemStructure>
          {session?.user.role === Role.ADMIN && (
            <ItemStructure title="หัวหน้าของโครงการ" required mode="vertical">
              <ControlledSelect
                className="w-full"
                placeholder="เลือกหัวหน้าของโครงการ"
                option={personnelOptions}
                searchable
                // checkIconPosition="right"
                // searchable
                control={control}
                name="personnelId"
              />
            </ItemStructure>
          )}

          <ItemStructure title="ผู้รับผิดชอบโครงการ" required mode="vertical">
            {/* <Select
                  placeholder="เลือกประเภทโครงการ"
                  data={projectTypeOptions}
                /> */}
            <ControlledMultiSelect
              required
              searchable
              control={control}
              name="owners"
              placeholder="เลือกผู้รับผิดชอบโครงการ"
              option={
                personnelOptions?.filter(
                  (person) =>
                    person.value !== watch("personnelId") &&
                    Number(person.value) !== session?.user.id,
                ) ?? []
              }
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
              searchable
              control={control}
              name="areaId"
            />
          </ItemStructure>
          {/* <ItemStructure
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
          </ItemStructure> */}
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
          {/* <ItemStructure title="ประเภทโครงการ" required mode="vertical">
            <ControlledSelect
              className="w-full"
              placeholder="เลือกประเภทโครงการ"
              option={projectTypeOptions}
              // checkIconPosition="right"
              // searchable
              control={control}
              searchable
              name="typeId"
            />
          </ItemStructure> */}
          <ItemStructure title="ตัวชี้วัด" required mode="vertical">
            {/* <Select
                  placeholder="เลือกประเภทโครงการ"
                  data={projectTypeOptions}
                /> */}
            <ControlledMultiSelect
              required
              searchable
              control={control}
              name="indicators"
              // label="เลือกตัวชี้วัด"
              placeholder="เลือกตัวชี้วัด"
              option={indicatorOptions}
            />
          </ItemStructure>
          <ItemStructure
            title="หน่วยงานร่วมดำเนินโครงการ"
            required
            mode="vertical"
          >
            {/* <Select
                  placeholder="เลือกประเภทโครงการ"
                  data={projectTypeOptions}
                /> */}
            <ControlledMultiSelect
              // className="w-full"
              placeholder="เลือกหน่วยงานร่วมดำเนินโครงการ"
              option={agencyOptions}
              // checkIconPosition="right"
              // searchable
              control={control}
              searchable
              name="participatingAgencies"
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
              searchable
              name="typeId"
            />
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
          <UploadProjectFile
            setApprovalProjectFilePath={setApprovalProjectFilePath}
            fileUrl={approvalProjectFilePathWatch}
            // setSupportProjectFilePath={setSupportProjectFilePath}
          />
          <Button color="blue" leftSection={<Plus />} type="submit">
            บันทึก
          </Button>
        </form>
      </Modal>
    </>
  );
}

export default CreateProjectModal;
