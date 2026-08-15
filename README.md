<div align="center">

# ⚡ React Form Control

**A form controller for React with TypeScript support and URL query synchronization.**

Manage form state, input changes, submissions, debouncing and query parameters with a straightforward API.

[![npm version](https://img.shields.io/npm/v/@carlosot2/react-form-control.svg)](https://www.npmjs.com/package/@carlosot2/react-form-control)
[![npm downloads](https://img.shields.io/npm/dm/@carlosot2/react-form-control.svg)](https://www.npmjs.com/package/@carlosot2/react-form-control)
[![license](https://img.shields.io/npm/l/@carlosot2/react-form-control.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178C6)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- 🎛️ Simple form state management
- ⌨️ Automatic input change handling
- ☑️ Built-in checkbox support with multiple values
- 📤 Form submission controller
- ⏱️ Optional debounced submission with `submitOnChange`
- 🔗 URL query parameter synchronization
- ↩️ Browser back/forward synchronization
- 🧩 Generic TypeScript form types

---

## 📦 Installation

```bash
npm install @carlosot2/react-form-control
```

---

## 🚀 Basic Usage

Define the structure of your form:

```ts
type SearchForm = {
    name: string
    author: string
}
```

Create the form controller:

```tsx
import { useFormController } from '@carlosot2/react-form-control'

function Search() {
    const { InputsController, SubmitController } =
        useFormController<SearchForm>({
            handleSubmit
        })

    async function handleSubmit(data: SearchForm) {
        console.log(data)
    }

    return (
        <form onSubmit={SubmitController.onSubmit}>
            <input
                type="text"
                name="name"
                value={InputsController.data.name ?? ''}
                onChange={InputsController.onChange}
            />

            <input
                type="text"
                name="author"
                value={InputsController.data.author ?? ''}
                onChange={InputsController.onChange}
            />

            <button type="submit">
                Search
            </button>
        </form>
    )
}
```

The controller stores values using each input's `name` property.

For example:

```ts
InputsController.data
```

could contain:

```ts
{
    name: 'Dandadan',
    author: 'Yukinobu Tatsu'
}
```

---

## 🎛️ InputsController

`InputsController` is responsible for reading and updating form values.

```ts
const { InputsController } = useFormController(...)
```

It provides:

```ts
InputsController.data
InputsController.onChange
InputsController.changeValue
```

### `data`

Contains the current form values.

```ts
InputsController.data.name
InputsController.data.author
```

### `onChange`

Pass it directly to supported inputs:

```tsx
<input
    name="name"
    value={InputsController.data.name ?? ''}
    onChange={InputsController.onChange}
/>
```

The input `name` is used as the key inside the form data.

### `changeValue`

Updates a value manually without requiring an input event.

```ts
InputsController.changeValue('name', 'Dandadan')
```

This is useful for:

- custom components
- clearing fields
- buttons
- manually controlled values
- external state changes

Example:

```tsx
<button
    type="button"
    onClick={() => InputsController.changeValue('name', '')}
>
    Clear
</button>
```

---

## ☑️ Checkbox Support

React Form Control automatically handles checkbox values as arrays.

Use the same `name` for checkboxes that belong to the same field:

```tsx
<input
    type="checkbox"
    name="genres"
    value="action"
    checked={InputsController.data.genres?.includes('action') ?? false}
    onChange={InputsController.onChange}
/>

<input
    type="checkbox"
    name="genres"
    value="comedy"
    checked={InputsController.data.genres?.includes('comedy') ?? false}
    onChange={InputsController.onChange}
/>
```

When both options are selected, the form data will contain:

```ts
{
    genres: ['action', 'comedy']
}
```

Selecting an unchecked option adds its value to the array, while selecting an already checked option removes it.

Checkbox values also work with **Query Control**, where repeated values are represented as repeated URL query parameters:

```txt
?genres=action&genres=comedy
```

---

## 📤 SubmitController

`SubmitController` provides the form submission handler.

```tsx
<form onSubmit={SubmitController.onSubmit}>
```

When the form is submitted, the current form data is passed to `handleSubmit`.

```tsx
const { InputsController, SubmitController } =
    useFormController<SearchForm>({
        handleSubmit
    })

async function handleSubmit(data: SearchForm) {
    console.log(data)
}
```

---

## ⏱️ Automatic Submission

Enable `submitOnChange` to automatically submit the form shortly after its values change.

```tsx
const { InputsController } =
    useFormController<SearchForm>({
        handleSubmit,
        submitOnChange: true
    })
```

Example:

```ts
async function handleSubmit(data: SearchForm) {
    const response = await searchTitles(data)
    console.log(response)
}
```

This is useful for:

- search bars
- filters
- live search
- dynamic results
- auto-updating forms

Changes are debounced to avoid submitting repeatedly while the user is still typing.

---

## 🔗 Query Control

React Form Control can synchronize form values with the URL query string.

Enable it with:

```tsx
const { InputsController, SubmitController } =
    useFormController<SearchForm>({
        queryControl: true,
        handleQueryChange
    })
```

Then define what should happen whenever the query changes:

```ts
async function handleQueryChange(query: string) {
    console.log(query)
}
```

A form like:

```ts
{
    name: 'Dandadan',
    genres: ['action', 'comedy']
}
```

can produce:

```txt
?name=Dandadan&genres=action&genres=comedy
```

---

## 🔄 Query Synchronization

With `queryControl` enabled, the controller keeps the form synchronized with the URL.

```text
Form Data
    ↓
URL Query
    ↓
Browser History
    ↓
Form Data
```

This includes browser navigation such as:

- Back
- Forward

For example:

```txt
/titles?name=naruto
```

then:

```txt
/titles?name=bleach
```

If the user presses Back, the form values are synchronized with:

```txt
?name=naruto
```

---

## 🔎 Query Example

```tsx
type Filters = {
    name: string
    genresIds: string[]
}

function SearchPage() {
    const { InputsController, SubmitController } =
        useFormController<Filters>({
            queryControl: true,
            handleQueryChange
        })

    async function handleQueryChange(query: string) {
        const response = await fetch(`/api/titles?${query}`)
        const data = await response.json()

        console.log(data)
    }

    return (
        <form onSubmit={SubmitController.onSubmit}>
            <input
                name="name"
                value={InputsController.data.name ?? ''}
                onChange={InputsController.onChange}
            />

            <input
                type="checkbox"
                name="genresIds"
                value="1"
                checked={
                    InputsController.data.genresIds?.includes('1') ?? false
                }
                onChange={InputsController.onChange}
            />

            <input
                type="checkbox"
                name="genresIds"
                value="2"
                checked={
                    InputsController.data.genresIds?.includes('2') ?? false
                }
                onChange={InputsController.onChange}
            />

            <button type="submit">
                Search
            </button>
        </form>
    )
}
```

---

## 🧩 TypeScript

React Form Control supports generic form types.

```ts
type LoginForm = {
    email: string
    password: string
}
```

Pass the type to the hook:

```ts
const { InputsController } =
    useFormController<LoginForm>({
        handleSubmit
    })
```

Now:

```ts
InputsController.data.email
```

is typed as:

```ts
string
```

and:

```ts
InputsController.data.password
```

is also typed as:

```ts
string
```

This allows the controller to stay generic while preserving the structure of each form.

---

## ⚙️ Configuration

### Standard form

```ts
useFormController({
    handleSubmit
})
```

### Automatic submit

```ts
useFormController({
    handleSubmit,
    submitOnChange: true
})
```

### Query-controlled form

```ts
useFormController({
    queryControl: true,
    handleQueryChange
})
```

### Query-controlled form with automatic updates

```ts
useFormController({
    queryControl: true,
    handleQueryChange,
    submitOnChange: true
})
```

---

## 📚 API

### `useFormController<TData>()`

```ts
useFormController<TData>(config)
```

Returns:

```ts
{
    InputsController,
    SubmitController
}
```

### `InputsController`

```ts
{
    data,
    onChange,
    changeValue
}
```

### `SubmitController`

```ts
{
    onSubmit
}
```

---

## 📄 License

Distributed under the MIT License.
