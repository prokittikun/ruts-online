import { createTRPCRouter } from "@/server/api/trpc";
import {
  getAllIndicator,
  getAllIndicatorPaginate,
  getIndicatorById,
} from "./GET";
import { createIndicator, updateIndicator } from "./POST";
import { deleteIndicator } from "./DELETE";

export const IndicatorRouter = createTRPCRouter({
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getAllIndicator,
  getAllIndicatorPaginate,
  getIndicatorById,
});
