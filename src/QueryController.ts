//# Libs //
import { useEffect, useState } from 'react'
//# Types //
import type { data, InputsController } from './types/FormController'

/**
 * **Hook used to synchronize form state with URL query parameters.**
 *
 * Use **`handleSubmit`** to convert the current form data into
 * **URL query parameters** and update the URL.
 *
 * URL query changes are automatically reflected back into
 * **`InputsController`**, keeping the form state synchronized.
 *
 * Browser navigation, including **back** and **forward**, is also
 * reflected in the form values.
 *
 * Use **`params`** to access the current URL query parameters.
 */
export function useQueryController(InputsController: InputsController) {
    const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search))

    /**
     * Converts a data object into a URL query string.
     * Array values are represented using repeated query parameters.
     *
     * @param data - The data object to convert
     * @returns The resulting URL query string
     */
    function build(data: data): string {
        const params = new URLSearchParams()

        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    params.append(key, String(v))
                })
            } else {
                params.append(key, String(value))
            }
        })

        return params.toString()
    }

    /**
     * Converts the current URL query parameters into a data object.
     * Repeated query parameters are grouped into arrays.
     *
     * @returns The data parsed from the current URL query
     */
    function parse(): data {
        const result: data = {}
        const uniqueKeys = new Set(searchParams.keys())

        uniqueKeys.forEach(key => {
            result[key] = searchParams.getAll(key)
        })

        return result
    }

    /**
     * Applies the provided form data to the URL query parameters.
     *
     * @param data - The form data to apply to the URL
     */
    async function handleSubmit(data: data) {
        const query = build(data)
        const url = new URL(window.location.href)

        url.search = query
        window.history.pushState(null, '', url)

        setSearchParams(new URLSearchParams(query))
    }

    //.. Keeps query parameters synchronized with browser navigation,
    //.. including back and forward
    useEffect(() => {
        function handlePopState() {
            setSearchParams(new URLSearchParams(window.location.search))
        }
        window.addEventListener('popstate', handlePopState)
        return () => { window.removeEventListener('popstate', handlePopState) }
    }, [])

    //.. Keeps form values synchronized with URL query changes,
    //.. including browser navigation such as back and forward
    useEffect(() => {
        const parsedData = parse()
        const keys = new Set([...Object.keys(InputsController.data), ...Object.keys(parsedData)])

        keys.forEach(key => {
            const parsedValue = parsedData[key]
            const currentValue = InputsController.data[key]

            InputsController.changeValue(
                key,
                parsedValue ?? (Array.isArray(currentValue) ? [] : '')
            )
        })
    }, [searchParams])

    return { handleSubmit, params: searchParams }
}