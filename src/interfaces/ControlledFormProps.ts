import { type ReactNode } from "react";
import { type Control, type FieldValues, type Path } from "react-hook-form";

export default interface ControlledFormProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  type?: string;
  placeholder?: string;
  placeholder2?: string;
  placeholder3?: string;
  className?: string;
  maxList?: number;
  title?: string | JSX.Element;
  mode?: "vertical" | "horizontal";
  modeSelect?: "multiple" | "tags";
  required?: boolean;
  dateOutputType?: "string" | "date";
  maxLength?: number;
  disabled?: boolean;
  prefix?: ReactNode | string;
  prefix2?: ReactNode | string;
  postfix?: ReactNode | string;
  postfix2?: ReactNode | string;
  postfix3?: ReactNode | string;
  mask?: string;
  prefixSectionWidth?: number | string;
  postfixSectionWidth?: number | string;
  prefixSectionWidth2?: number | string;
  postfixSectionWidth2?: number | string;
}
