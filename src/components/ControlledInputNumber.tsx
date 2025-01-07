import {
    type FieldValues,
    type Path,
    type Control,
    Controller,
  } from "react-hook-form";
  import { NumberInput } from "@mantine/core";
  
  interface ControlledInputNumberProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    prefixSectionWidth?: number;
    suffixSectionWidth?: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    pattern?: string;
  }
  
  const ControlledInputNumber = <T extends FieldValues>(
    props: ControlledInputNumberProps<T>,
  ) => {
    return (
      <Controller
        rules={{ required: true }}
        name={props.name}
        control={props.control}
        render={({
          field: { onChange, value, ref },
          fieldState: { invalid, error },
          formState,
        }) => {
          const onChangeValue = (value: number | string) => {
            if (value === "" || value === null || value === undefined) {
              onChange(null);
            } else {
              onChange(value);
            }
          };
  
          return (
            <>
              <NumberInput
                pattern={props.pattern ? props.pattern : undefined}
                withAsterisk={props.required}
                label={props.label}
                error={error ? error.message : undefined}
                thousandSeparator=","
                leftSectionWidth={props.prefixSectionWidth}
                rightSectionWidth={props.suffixSectionWidth}
                rightSection={
                  props.suffix ? (
                    <div className="w-fit whitespace-nowrap">{props.suffix}</div>
                  ) : <></>
                }
                leftSection={
                  props.prefix && (
                    <div className="whitespace-nowrap">{props.prefix}</div>
                  )
                }
                className="w-full"
                disabled={props.disabled}
                placeholder={props.placeholder}
                onWheel={(e) => e.currentTarget.blur()}
                ref={ref}
                size="sm"
                value={value}
                onChange={onChangeValue}
              />
            </>
          );
        }}
      />
    );
  };
  
  export default ControlledInputNumber;
