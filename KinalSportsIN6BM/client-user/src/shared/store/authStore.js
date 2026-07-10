import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: async (accessToken, user, refreshToken) => {
        set({
          token: accessToken,
          user: user || get().user,
          isAuthenticated: true,
        });
        if (refreshToken) {
          try {
            const { setItemAsync } = await import("expo-secure-store");
            await setItemAsync("refreshToken", refreshToken);
          } catch {}
        }
      },

      setAccessToken: (token) => set({ token }),

      setUser: (user) => set({ user }),

      setUserField: (field, value) => {
        const user = { ...get().user, [field]: value };
        set({ user });
      },

      logout: async () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        try {
          const { deleteItemAsync } = await import("expo-secure-store");
          await deleteItemAsync("refreshToken");
        } catch {}
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          const decoded = decodeJwtPayload(state.token);
          if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            state?.logout();
          }
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);