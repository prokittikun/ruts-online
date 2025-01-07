interface Props {
    title: string | JSX.Element
    children: JSX.Element
    mode?: "vertical" | "horizontal"
    required?: boolean
}

const ItemStructure = (props: Props) => {

    const mode = props.mode ?? "horizontal"

    if (mode === "horizontal") {
        return (
            <div className="grid grid-cols-3 gap-10 items-start ">
                <div className="col-span-1 flex justify-end pt-2 text-end justify-end]">
                    <span>
                        {props.required && <span className="text-rose-500 font-bold">*</span>}  {props.title}
                    </span>
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                    {props.children}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1">
            <div>
                <span>
                    {props.required && <span className="text-rose-500 font-bold">*</span>}  {props.title}
                </span>
            </div>
            <div className="flex flex-col gap-2">
                {props.children}
            </div>
        </div>
    )
}

export default ItemStructure