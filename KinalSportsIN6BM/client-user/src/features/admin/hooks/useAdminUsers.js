import { useState, useCallback } from "react";
import authClient from "../../../shared/api/authClient";
import userClient from "../../../shared/api/userClient";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authClient.get("/users");
      setUsers(res.data.data || []);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await userClient.post("/users/create", data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, getUsers, createUser };
};
