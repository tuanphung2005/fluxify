import { addToast } from "@heroui/toast";

export const toast = {
    success: (message: string) => {
        addToast({
            title: message.toLowerCase(),
            color: "success",
            radius: "none",
            classNames: {
                title: "lowercase",
            }
        });
    },
    error: (message: string) => {
        addToast({
            title: message.toLowerCase(),
            color: "danger",
            radius: "none",
            classNames: {
                title: "lowercase",
            }
        });
    },
    info: (message: string) => {
        addToast({
            title: message.toLowerCase(),
            color: "primary",
            radius: "none",
            classNames: {
                title: "lowercase",
            }
        });
    },
};
