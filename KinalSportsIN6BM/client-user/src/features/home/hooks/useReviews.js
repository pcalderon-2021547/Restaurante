import { useState, useCallback } from 'react';
import userClient from '../../../shared/api/userClient';

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReviews = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.get(`/review/restaurant/${restaurantId}`);
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reseñas');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.post('/review/create', reviewData);
      if (data.success) return data.review;
      throw new Error(data.message || 'Error al crear reseña');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear reseña';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (id, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.put(`/review/update/${id}`, reviewData);
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, ...reviewData } : r));
        return data.review;
      }
      throw new Error(data.message || 'Error al actualizar reseña');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar reseña';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await userClient.delete(`/review/delete/${id}`);
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar reseña');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, loading, error, getReviews, createReview, updateReview, deleteReview };
};
