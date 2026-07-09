import { useState, useCallback } from "react";
import authClient from "../../../shared/api/authClient";
import { useAuthStore } from "../../../shared/store/authStore";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authClient.get("/profile");
      const userProfile = res.data.user || res.data;
      setProfile(userProfile);
      if (setUser) setUser(userProfile);
      return userProfile;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  return { profile, loading, error, getProfile };
};
