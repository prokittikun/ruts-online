import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import {
  CreateIndicatorSchema,
  type ICreateIndicator,
} from "@/schemas/indicator/createIndicator";
import {
  type IUpdateIndicator,
  UpdateIndicatorSchema,
} from "@/schemas/indicator/updateIndicator";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, Input, Modal, Popover, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconFileText,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { Table } from "antd";
import { type ColumnProps } from "antd/es/table";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { ProjectStatus } from "@prisma/client";
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   // const token = await getToken({
//   //     req: ctx.req,
//   //     secret: env.NEXTAUTH_SECRET,
//   // })
//   // if (token?.role) {
//   return {
//     redirect: {
//       permanent: false,
//       destination: `/ADMIN/announce`,
//     },
//     props: {},
//   };
//   // }
//   // return {
//   //   props: {},
//   // };
// };
function PdfManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<string | null>(null);
  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รออนุมัติ", value: ProjectStatus.PENDING },
    { label: "กำลังดำเนินการ", value: ProjectStatus.IN_PROGRESS },
    { label: "เสร็จสิ้น", value: ProjectStatus.COMPLETED },
    { label: "ยกเลิก", value: ProjectStatus.CANCELED },
    { label: "ปฏิเสธ", value: ProjectStatus.REJECT },
  ];
  return (
    <>
      <div className="flex flex-col gap-3">
        <Select
          label="กรุณาเลือกสถานะโครงการ"
          placeholder="เลือกสถานะโครงการ"
          data={statusOptions}
          searchable
          onChange={(value) => {
            setStatus(value);
          }}
          value={status}
        />
        <a href={`/api/report/project/${status}`} target="_blank" className="w-full">
          <Button variant="default"  className="w-full" leftSection={<IconFileText size={15} />}>
            พิมพ์รายงาน
          </Button>
        </a>
      </div>
    </>
  );
}

export default PdfManagement;
