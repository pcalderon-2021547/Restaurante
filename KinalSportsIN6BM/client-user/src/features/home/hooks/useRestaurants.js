import { useState, useCallback } from "react";
import userClient from "../../../shared/api/userClient";
import { extractErrorMessage } from "../../../shared/utils/extractErrorMessage";

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userClient.get("/restaurant");
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { restaurants, loading, error, getRestaurants };
};
