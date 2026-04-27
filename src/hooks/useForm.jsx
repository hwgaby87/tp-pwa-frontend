import { useState } from "react"

/* 

Este hook centraliza una forma de extraer informacion del formulario y sincronizarlo con un estado
EJ:
El usuario crea un workspace con title y description
Hay un estado interno donde se guarda el valor actual del campo title y description
    form_state = {
        title: 'test',
        description: ''
    }
*/

function useForm({ initialFormState, submitFn}) {
    const [formState, setFormState] = useState(
        initialFormState
    )

    function handleChangeInput(event) {
        const field_name = event.target.name
        const field_value = event.target.value
        setFormState(
            (prevFormState) => {
                return {
                    ...prevFormState,
                    [field_name]: field_value
                }
            }
        )
    }

    function onSubmit (event) {
        event.preventDefault()
        submitFn(formState)
    }

    function resetForm(){
        setFormState(initialFormState)
    }

    return {
        handleChangeInput, //es la funcion que debo ASOCIAR al cambio del input (onChange)
        onSubmit,
        formState, //es el estado con los valores MAS ACTUALES de cada campo de mi formulario
        resetForm
    }
}

export default useForm