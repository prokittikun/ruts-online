/* eslint-disable @typescript-eslint/no-unsafe-call */
// import useGetBoqFromProject from "@/hooks/queries/boq/useGetBoqFromProject";
// import useGetExportBoqFromProject from "@/hooks/queries/boq/useGetExportBoqFromProject";
import { NumberFormatter, Text } from "@mantine/core";
import { format } from "date-fns";
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";

export default function BoqReport(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
//   const getExportBoqFromProject = useGetExportBoqFromProject({
//     project_id: props.id ?? "",
//   });

//   const getBoqFromProject = useGetBoqFromProject({
//     project_id: props.id ?? "",
//   });

//   const totalGeneralCost = _.sumBy(
//     getExportBoqFromProject.data?.data.general_costs,
//     (o) => o.estimated_cost,
//   );

  return (
    <div className="a4-horizontal relative flex flex-col p-5 text-[14px]">
     
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      id: context.query.id?.toString(),
    //   user_id: context.query.user_id?.toString(),
    },
  };
}