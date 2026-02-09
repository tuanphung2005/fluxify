import { useState, useCallback } from "react";
import { ZodSchema, ZodError } from "zod";

interface UseFormValidationProps<T> {
    schema: ZodSchema<T>;
    initialValues: T;
    onSubmit: (values: T) => Promise<void> | void;
}

export function useFormValidation<T>({
    schema,
    initialValues,
    onSubmit,
}: UseFormValidationProps<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = useCallback(() => {
        try {
            schema.parse(values);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const zodError = error as any;
                const newErrors: Record<string, string> = {};
                zodError.errors.forEach((err: any) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [schema, values]);

    const handleChange = useCallback(
        (key: keyof T, value: any) => {
            setValues((prev) => ({ ...prev, [key]: value }));
            // Clear error for this field when changed
            if (errors[key as string]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[key as string];
                    return newErrors;
                });
            }
        },
        [errors],
    );

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (validate()) {
            try {
                await onSubmit(values);
            } catch (error) {
                console.error("Form submission error", error);
            }
        }
        setIsSubmitting(false);
    };

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        setValues,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        validate,
        resetForm,
    };
}
