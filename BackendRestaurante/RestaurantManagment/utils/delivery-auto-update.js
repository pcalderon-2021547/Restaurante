'use strict';

import Delivery from '../fields/delivery/delivery.js';
import Order from '../fields/order/order_model.js';

/**
 * Servicio para auto-actualizar estados de entrega
 * Este servicio se ejecuta cuando el servidor inicia para procesar entregas
 * que quedaron pendientes y también registra timeouts para nuevas entregas
 */

/**
 * Inicializar el servicio de auto-actualización
 * Se ejecuta al iniciar la aplicación
 */
export const initializeDeliveryAutoUpdate = async () => {
    try {
        console.log('🚀 Inicializando servicio de auto-actualización de entregas...');
        
        // Buscar entregas en tránsito que ya pasaron su tiempo programado
        await processOverdueDeliveries();
        
        // Registrar timeouts para entregas activas en tránsito
        await registerActiveDeliveryTimeouts();
        
        console.log('✅ Servicio de auto-actualización inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando servicio de auto-actualización:', error);
    }
};

/**
 * Procesar entregas que ya pasaron su tiempo programado
 */
const processOverdueDeliveries = async () => {
    try {
        const now = new Date();
        
        // Buscar entregas en tránsito cuyo tiempo programado ya pasó
        const overdueDeliveries = await Delivery.find({
            status: 'in_transit',
            scheduledDeliveryTime: { $lt: now }
        });

        console.log(`📦 Encontradas ${overdueDeliveries.length} entregas atrasadas para procesar`);

        for (const delivery of overdueDeliveries) {
            try {
                // Actualizar entrega
                const updated = await Delivery.findByIdAndUpdate(
                    delivery._id,
                    {
                        status: 'delivered',
                        deliveryEndTime: new Date(),
                        paymentStatus: 'completed'
                    },
                    { new: true }
                );

                // Actualizar orden asociada
                if (updated.order) {
                    await Order.findByIdAndUpdate(updated.order, { status: 'delivered' });
                }

                console.log(`✅ Entrega ${delivery._id} marcada como entregada (atrasada)`);
            } catch (error) {
                console.error(`❌ Error procesando entrega atrasada ${delivery._id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('❌ Error en processOverdueDeliveries:', error);
    }
};

/**
 * Registrar timeouts para entregas activas en tránsito
 */
const registerActiveDeliveryTimeouts = async () => {
    try {
        const now = new Date();
        
        // Buscar entregas en tránsito que aún no alcanzan su tiempo programado
        const activeDeliveries = await Delivery.find({
            status: 'in_transit',
            scheduledDeliveryTime: { $gte: now }
        });

        console.log(`⏰ Registrando ${activeDeliveries.length} entregas activas para auto-actualización`);

        for (const delivery of activeDeliveries) {
            if (delivery.scheduledDeliveryTime) {
                const timeUntilDelivery = delivery.scheduledDeliveryTime.getTime() - now.getTime();
                
                if (timeUntilDelivery > 0) {
                    // Registrar un timeout para esta entrega
                    scheduleDeliveryUpdate(delivery._id, timeUntilDelivery);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en registerActiveDeliveryTimeouts:', error);
    }
};

/**
 * Programar la actualización de una entrega
 */
const scheduleDeliveryUpdate = (deliveryId, timeUntilDelivery) => {
    setTimeout(async () => {
        try {
            const delivery = await Delivery.findById(deliveryId);
            
            if (delivery && delivery.status === 'in_transit') {
                // Actualizar entrega
                const updated = await Delivery.findByIdAndUpdate(
                    deliveryId,
                    {
                        status: 'delivered',
                        deliveryEndTime: new Date(),
                        paymentStatus: 'completed'
                    },
                    { new: true }
                );

                // Actualizar orden
                if (updated.order) {
                    await Order.findByIdAndUpdate(updated.order, { status: 'delivered' });
                }

                console.log(`✅ Entrega ${deliveryId} marcada como entregada automáticamente`);
            }
        } catch (error) {
            console.error(`❌ Error actualizando entrega ${deliveryId}:`, error.message);
        }
    }, timeUntilDelivery);
};

/**
 * Actualizar manualmente una entrega a 'delivered'
 * Útil si necesitas forzar la actualización desde otros controladores
 */
export const markDeliveryAsDelivered = async (deliveryId) => {
    try {
        const delivery = await Delivery.findByIdAndUpdate(
            deliveryId,
            {
                status: 'delivered',
                deliveryEndTime: new Date(),
                paymentStatus: 'completed'
            },
            { new: true }
        );

        if (delivery && delivery.order) {
            await Order.findByIdAndUpdate(delivery.order, { status: 'delivered' });
        }

        console.log(`✅ Entrega ${deliveryId} marcada como entregada manualmente`);
        return delivery;
    } catch (error) {
        console.error(`❌ Error marcando entrega como entregada:`, error);
        throw error;
    }
};

/**
 * Obtener información de entregas en tránsito
 */
export const getInTransitDeliveryInfo = async () => {
    try {
        const deliveries = await Delivery.find({ status: 'in_transit' });
        
        return deliveries.map(d => ({
            id: d._id,
            scheduledDeliveryTime: d.scheduledDeliveryTime,
            estimatedDeliveryTime: d.estimatedDeliveryTime,
            timeRemainingMinutes: Math.round(
                (d.scheduledDeliveryTime - new Date()) / 60000
            )
        }));
    } catch (error) {
        console.error('❌ Error obteniendo entregas en tránsito:', error);
        return [];
    }
};

export default {
    initializeDeliveryAutoUpdate,
    markDeliveryAsDelivered,
    getInTransitDeliveryInfo
};
