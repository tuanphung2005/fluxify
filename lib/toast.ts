import { addToast } from "@heroui/toast";

export const toast = {
  success: (message: string) => {
    addToast({
      title: message,
      color: "success",
      radius: "none",
    });
  },
  error: (message: string) => {
    addToast({
      title: message,
      color: "danger",
      radius: "none",
    });
  },
  info: (message: string) => {
    addToast({
      title: message,
      color: "primary",
      radius: "none",
    });
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    // Show loading toast
    const toastId = addToast({
      title: messages.loading,
      radius: "none",
    });

    // Handle success/error
    promise
      .then(() => {
        toast.success(messages.success);
      })
      .catch(() => {
        toast.error(messages.error);
      });

    return promise;
  },
};
