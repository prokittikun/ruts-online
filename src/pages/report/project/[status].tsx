import { api } from "@/utils/api";
import { FindProjectStatus } from "@/utils/ProjectStatusMap";
import { format } from "date-fns";
import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";

export default function EquipmentReport(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const status = props.status == "all" ? undefined : props.status;
  const getAllProjectByStatus =
    api.project.getAllProjectByStatus.useQuery(status);

  // const currentYear = new Date();
  // const gregorianYear = format(currentYear, "yyyy"); // This will always give the Gregorian year

  // // Convert Gregorian year to Buddhist Era (BE) by adding 543
  // const buddhistEraYear = parseInt(gregorianYear) + 543;

  // if (getAllEquipmentWithoutPagination.isLoading) {
  //   return <div>Loading...</div>;
  // }
  //   const mockData = Array.from({ length: 30 }, (_, index) => ({
  //     ...(getAllEquipmentWithoutPagination.data?.[0] ?? {}), // Clone the first object with fallback
  //     e_number: `E-Number-${index + 1}`, // Optionally modify some fields if needed
  //     e_name: `Equipment ${index + 1}`,
  //   }));

  return (
    <div className="a4-vertical content relative flex flex-col bg-white p-2 text-[14px] text-black">
      <div>
        <h1 className="mb-3 text-center text-lg font-bold">
          รายงานโครงการ
        </h1>
        {/* <div className="pdf-footer">
          <span className="datetime text-sm">
            พิมพ์เมื่อ{" "}
            {new Date().toLocaleString("th-TH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div> */}
        <table className="table-container mb-8 w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-6 py-3 text-center text-xs"
                style={{ width: "10px" }}
                >
                ลำดับ
              </th>
              <th className="border border-gray-300 px-6 py-3 text-center text-xs"
                style={{ width: "150px" }}
                >
                ชื่อโครงการ
              </th>
              <th className="border border-gray-300 px-6 py-3 text-center text-xs"
                style={{ width: "230px" }}
                >
                อาจารย์ผู้รับผิดชอบโครงการ
              </th>
              <th className="border border-gray-300 px-6 py-3 text-center text-xs">
                สาขา
              </th>
              <th
                className="border border-gray-300 px-6 py-3 text-center text-xs"
                style={{ width: "150px" }}
              >
                สถานะโครงการ
              </th>
            </tr>
          </thead>
          <tbody>
            {getAllProjectByStatus.data?.map((project, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-6 py-2 text-center text-xs">
                  <p className="font-semibold">{index + 1}</p>
                </td>
                <td className="border border-gray-300 px-6 py-2 text-center text-xs">
                  <p className="font-semibold">{project.name}</p>
                </td>
                <td className="border border-gray-300 px-6 py-2 text-center text-xs">
                  <p className="font-semibold">{project.Personnel?.name}</p>
                </td>
                <td className="border border-gray-300 px-6 py-2 text-center text-xs">
                  <p className="font-semibold">
                    {project.Personnel?.Department?.name}
                  </p>
                </td>
                <td className="border border-gray-300 px-6 py-2 text-center text-xs">
                  <p className="font-semibold">
                    {FindProjectStatus(project.project_status)?.description}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      status: context.query.status?.toString(),
    },
  };
}
