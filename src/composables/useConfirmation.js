import { ref } from "vue";

export function useConfirmation() {
  const showConfirm = ref(false);
  const confirmTitle = ref("Confirm Action");
  const confirmMessage = ref("Are you sure you want to proceed?");
  const confirmType = ref("danger");
  const confirmLoading = ref(false);
  const confirmButtonText = ref("Confirm");

  let resolvePromise = null;

  const askConfirmation = (options = {}) => {
    confirmTitle.value = options.title || "Confirm Action";
    confirmMessage.value =
      options.message || "Are you sure you want to proceed?";
    confirmType.value = options.type || "danger";
    confirmButtonText.value = options.confirmText || "Confirm";
    confirmLoading.value = false;
    showConfirm.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const onConfirm = () => {
    showConfirm.value = false;
    if (resolvePromise) resolvePromise(true);
  };

  const onCancel = () => {
    showConfirm.value = false;
    if (resolvePromise) resolvePromise(false);
  };

  return {
    showConfirm,
    confirmTitle,
    confirmMessage,
    confirmType,
    confirmLoading,
    confirmButtonText,
    askConfirmation,
    onConfirm,
    onCancel,
  };
}
