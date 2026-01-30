import { Input, InputProps } from "@heroui/react";

interface ValidatedInputProps extends InputProps {
    error?: string;
}

export function ValidatedInput({ error, ...props }: ValidatedInputProps) {
    return (
        <Input
            {...props}
            errorMessage={error}
            isInvalid={!!error}
        />
    );
}
