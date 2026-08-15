export type data = Record<string, any>

export type InputsController<TData extends data = data> = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    changeValue: (name: string, value: any) => void,
    data: TData
}

export type SubmitController = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}