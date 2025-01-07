import {
  type FieldValues,
  type Path,
  type Control,
  Controller,
} from "react-hook-form";
import { type ComboboxData, Select } from "@mantine/core";
import clsx from "clsx";

interface ControlledSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  className?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  option?: ComboboxData;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  allowDeselect?: boolean;
  checkIconPosition?: "left" | "right";
}

const ControlledSelect = <T extends FieldValues>(
  props: ControlledSelectProps<T>,
) => {
  return (
    <Controller
      rules={{ required: true }}
      name={props.name}
      control={props.control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <Select
            className={clsx(props.className)}
            error={error?.message}
            onChange={onChange}
            value={value}
            label={props.label}
            description={props.description}
            placeholder={props.placeholder}
            data={props.option ?? []}
            clearable={props.clearable}
            searchable={props.searchable}
            allowDeselect={props.allowDeselect}
            checkIconPosition={props.checkIconPosition ?? "left"}
          />
        );
      }}
    />
  );
};

export default ControlledSelect;
