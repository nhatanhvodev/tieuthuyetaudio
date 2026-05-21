import { toast } from "sonner";

export function toastSuccess(message: string) {
  toast.success(message, {
    className: "admin-toast",
    duration: 3000
  });
}

export function toastError(message: string) {
  toast.error(message, {
    className: "admin-toast",
    duration: 5000
  });
}
