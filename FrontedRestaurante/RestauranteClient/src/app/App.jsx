import { AppRoutes } from "./router/AppRoutes.jsx";
import { Toaster } from "react-hot-toast"
import { ConfirmModal } from "../shared/components/ui/ConfirmModal.jsx";
import { useEffect } from "react";
import { useAuthStore } from "../features/auth/store/authStore.js";

export const App = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "0.85rem",
            borderRadius: "2px"
          }
        }}
      />
      <AppRoutes />
      <ConfirmModal />
    </>
  );
};
