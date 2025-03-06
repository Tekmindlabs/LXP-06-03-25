import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
};

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, {
        description,
      });
    case "success":
      return sonnerToast.success(title, {
        description,
      });
    case "warning":
      return sonnerToast.warning(title, {
        description,
      });
    default:
      return sonnerToast(title, {
        description,
      });
  }
};

export type ToastContextType = {
  toast: (props: ToastProps) => void;
  addToast: (props: ToastProps) => string;
};

// For compatibility with existing code that uses useToast
export const useToast = (): ToastContextType => {
  return {
    toast,
    // For compatibility with code that expects addToast
    addToast: ({ title, description, variant }: ToastProps) => {
      toast({ title, description, variant });
      return Math.random().toString(36).substring(2, 9); // Return a random ID for compatibility
    }
  };
};