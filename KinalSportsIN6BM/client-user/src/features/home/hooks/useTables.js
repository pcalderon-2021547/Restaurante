import { useState, useCallback } from 'react';
import userClient from '../../../shared/api/userClient';

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTables = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.get('/table', { params: { restaurant: restaurantId } });
      if (data.success) setTables(data.tables || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar mesas');
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tables, loading, error, getTables };
};
