import { type IStringifyOptions } from "qs";

export const QSConfig: IStringifyOptions = {
  addQueryPrefix: true,
  skipNulls: true,
  arrayFormat: "comma",
  encode: false,
};