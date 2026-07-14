import { useState, useCallback } from 'react';
import userClient from '../../../shared/api/userClient';

export const useAdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.get('/restaurant');
      if (data.success) setRestaurants(data.restaurants || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (id, currentStatus) => {
    try {
      await userClient.put(`/restaurant/update/${id}`, { isActive: !currentStatus });
      setRestaurants(prev => prev.map(r =>
        r._id === id ? { ...r, isActive: !currentStatus } : r
      ));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar');
      return false;
    }
  }, []);

  return { restaurants, loading, error, getRestaurants, toggleStatus };
};
