//# Types //
import type { InputsController, SubmitController, data } from './types/FormController'
//# Libs //
import { useEffect, useState } from "react";
import { useQueryController } from './QueryController'

type baseConfig = {
    submitOnChange?: boolean
}

type config =
    | (baseConfig & {
        queryControl: true
        handleQueryChange: (query: string) => Promise<any>
        handleSubmit?: never

    })
    | (baseConfig & {
        queryControl?: false
        handleSubmit: (...args: any[]) => Promise<any>
        handleQueryChange?: never
    })

/**
 * **Hook used to manage form state and submission behavior.**
 *
 * When **`queryControl`** is enabled:
 * - The form state is synchronized with the **URL query parameters**
 * - **`handleQueryChange`** is called whenever the query changes
 *
 * Use **`InputsController`** to read and update form values.
 *
 * Use **`SubmitController.onSubmit`** as the form's `onSubmit` handler.
 *
 * Enable **`submitOnChange`** to automatically submit changes
 * after the user stops modifying the form.
 */
export function useFormController<TData extends data = data>(config: config) {
    const { handleSubmit, submitOnChange, queryControl, handleQueryChange } = config

    const [data, setData] = useState<TData>({} as TData)

    const InputsController: InputsController<TData> = { onChange, changeValue, data, }
    const QueryController = useQueryController(InputsController)
    const SubmitController: SubmitController = { onSubmit: onSubmit, }

    /**
     * Updates the form state when an input changes.
     * Checkbox values are stored as arrays, while other inputs
     * replace the current field value.
     *
     * @param event - The input change event
     */
    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type } = event.target

        if (type == 'checkbox') {
            setData(prev => {
                const current = (prev[name] as any[]) || [];

                return {
                    ...prev,
                    [name]: current.includes(value)
                        ? current.filter((v: any) => v !== value)
                        : [...current, value]
                };
            });
        }
        else {
            setData(prev => ({ ...prev, [name]: value }))
        }
    }

    /**
     * Updates a form field directly without requiring an input event.
     *
     * @param name - The field name to update
     * @param value - The new field value
     */
    function changeValue(name: string, value: any) {
        setData(prev => ({ ...prev, [name]: value }))
    }

    /**
     * Handles form submission according to the configured mode.
     *
     * With queryControl enabled, the current form values are applied
     * to the URL query. Otherwise, handleSubmit receives the form data.
     *
     * @param event - The form submit event
     */
    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (queryControl) {
            QueryController.handleSubmit(InputsController.data)
        } else {
            await handleSubmit(InputsController.data)
        }

    }

    //.. Handles the initial query and any subsequent URL query changes
    useEffect(() => {
        if (!queryControl || !handleQueryChange) return
        const query = QueryController.params.toString()
        handleQueryChange(query)
    }, [QueryController.params])

    //.. Automatically submits changes shortly after the user stops modifying the form
    useEffect(() => {
        if (!submitOnChange) return

        //.. Prevents repeated submissions while the form is still being changed
        const timeout = setTimeout(() => {
            if (queryControl) {
                QueryController.handleSubmit(data)
            } else {
                handleSubmit(data)
            }
        }, 500)

        return () => clearTimeout(timeout)
    }, [data])

    return { InputsController, SubmitController }
}