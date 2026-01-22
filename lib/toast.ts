import { addToast } from "@heroui/toast";

export const toast = {
  success: (message: string) => {
    addToast({
      title: message.toLowerCase(),
      color: "success",
      radius: "none",
      classNames: {
        title: "lowercase",
      },
    });
  },
  error: (message: string) => {
    addToast({
      title: message.toLowerCase(),
      color: "danger",
      radius: "none",
      classNames: {
        title: "lowercase",
      },
    });
  },
  info: (message: string) => {
    addToast({
      title: message.toLowerCase(),
      color: "primary",
      radius: "none",
      classNames: {
        title: "lowercase",
      },
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
      title: messages.loading.toLowerCase(),
      radius: "none",
      classNames: {
        title: "lowercase",
      },
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
