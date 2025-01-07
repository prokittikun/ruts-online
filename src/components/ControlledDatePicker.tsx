import {
    type FieldValues,
    type Path,
    type Control,
    Controller,
  } from "react-hook-form";
  import { type ComboboxData } from "@mantine/core";
  import {
    DatePickerInput,
    DatesProvider,
    type DatesRangeValue,
    type DateValue,
  } from "@mantine/dates";
  import "dayjs/locale/th";
  import { CalendarIcon } from "lucide-react";
  
  interface ControlledDatePickerProps<T extends FieldValues> {
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
    prefixSectionWidth?: number;
    suffixSectionWidth?: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
  }
  
  const ControlledDatePicker = <T extends FieldValues>(
    props: ControlledDatePickerProps<T>,
  ) => {
    return (
      <Controller
        rules={{ required: true }}
        name={props.name}
        control={props.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          const handleOnChange = (date: DateValue | DatesRangeValue | Date[]) => {
            onChange(date);
          };
          return (
            <DatesProvider
              settings={{
                locale: "th",
                timezone: "Asia/Bangkok",
              }}
            >
              <DatePickerInput
                withAsterisk={props.required}
                valueFormat="วันddddที่ DD MMMM YYYY"
                error={error ? error.message : undefined}
                disabled={props.disabled}
                placeholder={props.placeholder}
                label={props.label}
                value={value}
                onChange={handleOnChange}
                leftSectionWidth={props.prefixSectionWidth}
                rightSectionWidth={props.suffixSectionWidth}
                rightSection={
                  (props.prefix ? <CalendarIcon size={15} /> : undefined) ?? (
                    <CalendarIcon size={15} />
                  )
                }
                leftSection={
                  props.prefix && (
                    <div className="whitespace-nowrap">{props.prefix}</div>
                  )
                }
                className={props.className}
                clearable={props.clearable}
              />
            </DatesProvider>
          );
        }}
      />
    );
  };
  
  export default ControlledDatePicker;
