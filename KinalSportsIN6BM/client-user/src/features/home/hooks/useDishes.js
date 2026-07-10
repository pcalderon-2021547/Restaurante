import { useState, useCallback } from 'react';
import userClient from '../../../shared/api/userClient';

export const useDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDishes = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.get('/dish', { params: { restaurant: restaurantId } });
      if (data.success) setDishes(data.dishes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar platillos');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dishes, loading, error, getDishes };
};
