import type ControlledFormProps from "@/interfaces/ControlledFormProps";
import { Checkbox, DatePicker, Select, TimePicker } from "antd";
import dayjs from "dayjs";
import { type ChangeEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import moment from 'moment';
import clsx from "clsx";
import { IMaskInput } from 'react-imask';
import { Input as InputMantine, Textarea } from '@mantine/core';
// import RichTextEditor from "../RichTextEditor";

export const ControlledInput = <T extends FieldValues>({
    name,
    control,
    placeholder,
    type,
    title,
    required,
    mode,
    postfix,
    prefix,
    disabled,
    mask,
    postfixSectionWidth,
    prefixSectionWidth
}: ControlledFormProps<T>) => {
    if (type === "currency") {
        return (
            <Controller
                rules={{ required: true }}
                name={name}
                control={control}
                render={({ field: { onChange, value, ref }, fieldState: { invalid, error }, formState }) => {
                    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.value === "") {

                            onChange(undefined);
                        } else {
                            onChange(parseFloat(e.target.value));
                        }

                    };
                    return (
                        <>
                            <InputMantine.Wrapper withAsterisk={required} label={title} error={error ? error.message : undefined} className="w-full" >
                                <InputMantine
                                    leftSectionWidth={prefixSectionWidth}
                                    rightSectionWidth={postfixSectionWidth}
                                    rightSection={<div className="whitespace-nowrap w-fit">{postfix}</div>}
                                    leftSection={prefix && <div className="whitespace-nowrap">{prefix}</div>}
                                    className="w-full"
                                    disabled={disabled}
                                    placeholder={placeholder}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    ref={ref}
                                    size='sm'
                                    type={type}
                                    value={String(value) ?? ""}
                                    onChange={handleOnChange}
                                />
                            </InputMantine.Wrapper>
                        </>
                    );
                }}
            />
        )
    }

    const modeFinal = mode ?? "horizontal"

    if (modeFinal === "horizontal") {
        return (
            <Controller
                rules={{ required: true }}
                name={name}
                control={control}
                render={({ field: { onChange, value, ref }, fieldState: { invalid, error }, formState }) => {

                    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
                        if (type === "number") {
                            if (e.target.value === "") {
                                onChange(undefined);
                            } else {
                                onChange(parseFloat(e.target.value));
                            }
                        } else {
                            onChange(e.target.value);
                        }
                    };

                    return (
                        <>
                            {
                                mask ? <>
                                    <InputMantine.Wrapper withAsterisk={required} label={title} error={error ? error.message : undefined} className="w-full" >
                                        <InputMantine leftSectionWidth={prefixSectionWidth} rightSectionWidth={postfixSectionWidth} rightSection={<div className="whitespace-nowrap w-fit">{postfix}</div>} leftSection={prefix && <div className="whitespace-nowrap">{prefix}</div>} component={IMaskInput} mask={mask} className="w-full" disabled={disabled} placeholder={placeholder} onWheel={(e) => e.currentTarget.blur()} ref={ref} size='sm' type={type} value={value ?? ""} onChange={handleOnChange} />
                                    </InputMantine.Wrapper>
                                </> : <>
                                    <InputMantine.Wrapper withAsterisk={required} label={title} error={error ? error.message : undefined} className="w-full" >
                                        <InputMantine leftSectionWidth={prefixSectionWidth} rightSectionWidth={postfixSectionWidth} rightSection={<div className="whitespace-nowrap w-fit">{postfix}</div>} leftSection={prefix && <div className="whitespace-nowrap">{prefix}</div>} className="w-full" disabled={disabled} placeholder={placeholder} onWheel={(e) => e.currentTarget.blur()} ref={ref} size='sm' type={type} value={value ?? ""} onChange={handleOnChange} />
                                    </InputMantine.Wrapper>
                                </>
                            }
                        </>
                    );
                }}
            />
        )
    }

    return (
        <Controller
            rules={{ required: true }}
            name={name}
            control={control}
            render={({ field: { onChange, value, ref }, fieldState: { invalid, error }, formState }) => {
                const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
                    if (type === "number") {
                        if (e.target.value === "") {
                            onChange(undefined);
                        } else {
                            onChange(parseFloat(e.target.value));
                        }
                    } else {
                        onChange(e.target.value);
                    }
                };
                return (
                    <>
                        {
                            mask ? <>
                                <InputMantine.Wrapper withAsterisk={required} label={title} error={error ? error.message : undefined} className="w-full" >
                                    <InputMantine leftSectionWidth={prefixSectionWidth} rightSectionWidth={postfixSectionWidth} rightSection={<div className="whitespace-nowrap w-fit">{postfix}</div>} leftSection={prefix && <div className="whitespace-nowrap">{prefix}</div>} component={IMaskInput} mask={mask} className="w-full" disabled={disabled} placeholder={placeholder} onWheel={(e) => e.currentTarget.blur()} ref={ref} size='sm' type={type} value={value ?? ""} onChange={handleOnChange} />
                                </InputMantine.Wrapper>
                            </> : <>
                                <InputMantine.Wrapper withAsterisk={required} label={title} error={error ? error.message : undefined} className="w-full">
                                    <InputMantine leftSectionWidth={prefixSectionWidth} rightSectionWidth={postfixSectionWidth} rightSection={<div className="whitespace-nowrap w-fit">{postfix}</div>} leftSection={prefix && <div className="whitespace-nowrap">{prefix}</div>} className="w-full" disabled={disabled} placeholder={placeholder} onWheel={(e) => e.currentTarget.blur()} ref={ref} size='sm' type={type} value={value ?? ""} onChange={handleOnChange} />
                                </InputMantine.Wrapper>
                            </>
                        }
                    </>
                );
            }}
        />
    )
};


export const ControlledTextArea = <T extends FieldValues>({
    name,
    control,
    placeholder,
    className,
    required,
    title
}: ControlledFormProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid, error } }) => {
                return (
                    <div className="flex flex-col w-full">
                        <Textarea
                            rows={7}
                            withAsterisk={required}
                            label={title}
                            placeholder={placeholder}
                            error={error ? error.message : undefined}
                            {...field}
                        />
                    </div>
                )
            }}
        />
    );
};

export const ControlledDatePicker = <T extends FieldValues>({
    name,
    control,
    placeholder,
    className,
    dateOutputType,
    prefix,
    postfix
}: ControlledFormProps<T>) => {
    moment.locale('th');
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid } }) => (
                <div className="flex flex-row gap-1 items-center">
                    {prefix && <div className="whitespace-nowrap">{prefix}</div>}
                    <DatePicker
                        className={clsx(
                            "text-xl",
                            className ?? "",
                        )}
                        size="large"
                        placeholder={placeholder}
                        format={'DD/MM/YYYY'}
                        value={field.value !== undefined ? dayjs(field.value) : null}
                        status={invalid ? "error" : undefined}
                        onChange={(v) => {
                            if (dateOutputType === "string") {
                                return field.onChange(v?.toDate().toISOString())
                            }
                            field.onChange(v?.toDate())
                        }}
                    />
                    {postfix && <div className="whitespace-nowrap">{postfix}</div>}
                </div>
            )}
        />
    );
};

export const ControlledTimePicker = <T extends FieldValues>({
    name,
    control,
    placeholder,
    className,
    dateOutputType
}: ControlledFormProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid } }) => (
                <TimePicker
                    className={clsx(
                        "text-xl",
                        className ?? "",
                    )}
                    size="large"
                    format={'HH:mm'}
                    placeholder={placeholder}
                    value={field.value !== undefined ? dayjs(field.value) : null}
                    status={invalid ? "error" : undefined}
                    onChange={(v) => {
                        if (dateOutputType === "string") {
                            return field.onChange(v?.toDate().toISOString())
                        }
                        return field.onChange(v?.toDate())
                    }}
                />
            )}
        />
    );
}

export const ControlledSelect = <T extends FieldValues>({
    name,
    control,
    options,
    placeholder,
    className,
    modeSelect
}: ControlledFormProps<T> & {
    modeSelect?: "multiple" | "tags";
    options: { label: any; value: any }[];
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid } }) => (
                <Select
                    className={clsx(className ?? "")}
                    size="large"
                    placeholder={placeholder}
                    mode={modeSelect}
                    status={invalid ? "error" : undefined}
                    options={options}
                    onChange={(v) => field.onChange(v)}
                    value={field.value}
                />
            )}
        />
    );
};

export const ControlledCheckboxObject = <T extends FieldValues>({
    name,
    control,
    className,
    placeholder
}: ControlledFormProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid } }) => {
                return (
                    <Checkbox className={clsx(className ?? "")} onChange={(v) => {
                        return v.target.checked ? field.onChange({}) : field.onChange(undefined)
                    }} value={field.value ? true : false}>{placeholder}</Checkbox>
                )
            }}
        />
    );
}

export const ControlledCheckbox = <T extends FieldValues>({
    name,
    control,
    className,
    placeholder
}: ControlledFormProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { invalid } }) => {

                return (
                    <Checkbox className={clsx(className ?? "")} onChange={(v) => field.onChange(v.target.checked)} checked={field.value}>{placeholder}</Checkbox>
                )
            }}
        />
    );
}

// export const ControlledRichTextEditor = <T extends FieldValues>({
//     name,
//     control,
//     placeholder
// }: ControlledFormProps<T>) => {
//     return (
//         <Controller
//             name={name}
//             control={control}
//             render={({ field, fieldState: { invalid, error } }) => {
//                 return (
//                     <RichTextEditor
//                         value={field.value ?? ""}
//                         onChange={field.onChange}
//                         error={error?.message}
//                     />
//                 )
//             }}
//         />

//     )
// };