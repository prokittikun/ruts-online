import qs from "qs";
import { v4 as uuid } from "uuid";
import { type z } from "zod";

import { QSConfig } from "@/configs/common/QSConfig";
// import { redisClient } from "@/configs/redis/redis";

import { downloadSchema } from "./_schema/download.schema";
import { axiosBrowserLess } from "utils/axiosAPI";
import _ from "lodash";

export const getPdfSchema = downloadSchema;

export type GetPdfInput = z.infer<typeof getPdfSchema>;

const getPdfService = async (props: GetPdfInput) => {
  try {
    const width = 600;
    const selector = "#capture";

    const keyId = uuid();
    // await redisClient.set(
    //   keyId,
    //   JSON.stringify(props.courseData),
    //   "EX",
    //   60, // 1 minute
    // );

    const queryProps = _.omit(props, ["courseData"]);

    const query = qs.stringify(
      {
        ...queryProps,
        id: keyId,
      },
      QSConfig,
    );

    const url = new URL(`${process.env.NEXTAUTH_URL}/download/pdf${query}`);

    const res = await axiosBrowserLess.post(
      "/chromium/pdf",
      {
        url: url,
        viewport: {
          width: width,
          height: 0,
        },
        gotoOptions: {
          waitUntil: "networkidle2",
        },
        options: {
          printBackground: true,
          landscape: true,
          format: "A4",
          scale: 0.8,
        },
        waitForTimeout: 0,
      },
      {
        responseType: "arraybuffer",
      },
    );

    await redisClient.del(keyId);

    return "data:application/pdf;base64," + Buffer.from(res.data).toString("base64");
  } catch (error) {
    throw error;
  }
};

export default getPdfService;