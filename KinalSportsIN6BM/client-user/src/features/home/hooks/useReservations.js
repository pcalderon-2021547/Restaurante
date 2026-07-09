import { useState, useCallback } from 'react';
import userClient from '../../../shared/api/userClient';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMyReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.get('/reservation/my-reservations');
      if (data.success) setReservations(data.reservations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (reservationData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userClient.post('/reservation/create', reservationData);
      if (data.success) return data.reservation;
      throw new Error(data.message || 'Error al crear reservación');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear reservación';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await userClient.delete(`/reservation/delete/${id}`);
      if (data.success) {
        setReservations(prev => prev.filter(r => r._id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id, reservationData) => {
    setLoading(true);
    try {
      const { data } = await userClient.put(`/reservation/update/${id}`, reservationData);
      if (data.success) {
        setReservations(prev => prev.map(r => r._id === id ? { ...r, ...reservationData } : r));
        return data.reservation;
      }
      throw new Error(data.message || 'Error al actualizar');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async (restaurantId, date, time) => {
    try {
      const dateStr = new Date(date + "T" + time).toISOString();
      const { data } = await userClient.get("/reservation", {
        params: { restaurant: restaurantId, date: dateStr }
      });
      return data.success ? (data.reservations || []) : [];
    } catch {
      return [];
    }
  }, []);

  return { reservations, loading, error, getMyReservations, createReservation, cancelReservation, updateReservation, checkAvailability };
};
