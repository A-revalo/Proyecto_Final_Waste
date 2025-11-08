import { useState } from 'react';

const useForm = (initialState = {}) => {
    // Estado del formulario y errores
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    // Función para resetear el formulario
    const resetForm = () => {
        setFormData(initialState);
        setErrors({});
    };

    return {
        formData,          // Estado actual del formulario
        setFormData,       // Función para actualizar el estado del formulario
        errors,           // Estado de los errores
        setErrors,        // Función para actualizar los errores
        resetForm         // Función para resetear el formulario
    };
};

export default useForm;