import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, ShoppingCart, Zap } from "lucide-react";

/**
 * BAP Protocol Toast Utility
 * Centralized toast notifications with consistent styling
 */

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  description?: string;
  action?: ToastAction;
  duration?: number;
}

/**
 * Success toast with BAP Protocol styling
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration || 3000,
    icon: <CheckCircle2 className="w-5 h-5 text-[#0cc0df]" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    classNames: {
      toast: "border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white",
      title: "text-gray-900 font-bold",
      description: "text-gray-600",
      actionButton: "bg-[#0cc0df] text-black font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
      closeButton: "border-2 border-black rounded-lg hover:bg-gray-100",
    },
  });
}

/**
 * Error toast with BAP Protocol styling
 */
export function toastError(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    classNames: {
      toast: "border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white",
      title: "text-gray-900 font-bold",
      description: "text-gray-600",
      actionButton: "bg-[#0cc0df] text-black font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
      closeButton: "border-2 border-black rounded-lg hover:bg-gray-100",
    },
  });
}

/**
 * Cart-specific success toast with "View Cart" action
 */
export function toastCartSuccess(message: string = "Added to cart!") {
  return toastSuccess(message, {
    action: {
      label: "View Cart",
      onClick: () => {
        window.location.href = "/cart";
      },
    },
  });
}

/**
 * Wishlist-specific success toast with "View Wishlist" action
 */
export function toastWishlistSuccess(message: string = "Added to wishlist!") {
  return toastSuccess(message, {
    action: {
      label: "View Wishlist",
      onClick: () => {
        window.location.href = "/wishlist";
      },
    },
  });
}

/**
 * Generic info toast with BAP Protocol styling
 */
export function toastInfo(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration || 3000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    classNames: {
      toast: "border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white",
      title: "text-gray-900 font-bold",
      description: "text-gray-600",
      actionButton: "bg-[#0cc0df] text-black font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]",
      closeButton: "border-2 border-black rounded-lg hover:bg-gray-100",
    },
  });
}

// Re-export original toast for backwards compatibility
export { sonnerToast as toast };
