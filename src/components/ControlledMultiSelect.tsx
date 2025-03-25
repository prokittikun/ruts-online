import {
  type FieldValues,
  type Path,
  type Control,
  Controller,
} from "react-hook-form";
import { type ComboboxData, MultiSelect } from "@mantine/core";
import React from "react";

interface ControlledMultiSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  option?: ComboboxData;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  searchable?: boolean;
}

const ControlledMultiSelect = <T extends FieldValues>(
  props: ControlledMultiSelectProps<T>,
) => {
  return (
    <Controller
      rules={{ required: true }}
      name={props.name}
      control={props.control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        return (
          <>
            <MultiSelect
              withAsterisk={props.required}
              error={error?.message}
              onChange={onChange}
              value={value}
              label={props.label}
              placeholder={props.placeholder}
              data={props.option ?? []}
              clearable={props.clearable}
              searchable={props.searchable}
              className="w-full"
            />
          </>
        );
      }}
    />
  );
};

export default ControlledMultiSelect;
