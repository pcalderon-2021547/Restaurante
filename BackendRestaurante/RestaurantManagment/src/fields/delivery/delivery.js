'use strict';

import mongoose from 'mongoose';

const deliverySchema = mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },

        orderDetails: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderDetail',
            required: true
        }],

        deliveryAddress: {
            street: {
                type: String,
                required: true
            },
            number: {
                type: String,
                required: true
            },
            neighborhood: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: false
            },
            reference: {
                type: String,
                required: false
            }
        },

        deliveryZone: {
            type: String,
            required: false
        },

        distance: {
            type: Number,
            required: false,
            default: 0
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0
        },

        estimatedDeliveryTime: {
            type: Number,
            default: 40,
            description: 'Tiempo estimado en minutos'
        },

        deliveryPerson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },

        deliveryPersonContact: {
            type: String,
            required: false
        },

        status: {
            type: String,
            enum: [
                'pending_acceptance',
                'accepted',
                'preparing',
                'ready_for_delivery',
                'in_transit',
                'delivered',
                'cancelled',
                'failed_delivery'
            ],
            default: 'pending_acceptance'
        },

        scheduledDeliveryTime: {
            type: Date,
            required: false,
            description: 'Hora en que se debe cambiar automáticamente a delivered'
        },

        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'transfer', 'digital_wallet'],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'completed'],
            default: 'pending'
        },

        specialInstructions: {
            type: String,
            required: false
        },

        deliveryStartTime: {
            type: Date,
            required: false
        },

        deliveryEndTime: {
            type: Date,
            required: false
        },

        customerSignature: {
            type: String,
            required: false
        },

        deliveryNotes: {
            type: String,
            required: false
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: false
        },

        feedback: {
            type: String,
            required: false
        },

        subtotal: {
            type: Number,
            default: 0,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        total: {
            type: Number,
            default: 0,
            min: 0
        },

        cancelledReason: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

/**
 * Pre-save middleware
 * Cuando el estado cambia a 'in_transit', calcula el tiempo programado para cambiar a 'delivered'
 */
deliverySchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'in_transit' && !this.scheduledDeliveryTime) {
        // Obtener el tiempo estimado de entrega (por defecto 40 minutos)
        const estimatedTime = this.estimatedDeliveryTime || 40;
        // Calcular el tiempo en que debe cambiar automáticamente a delivered
        this.scheduledDeliveryTime = new Date(Date.now() + estimatedTime * 60 * 1000);
    }
    next();
});

/**
 * Post-save middleware
 * Crea un timeout para actualizar automáticamente el estado después del tiempo estimado
 */
deliverySchema.post('save', async function (doc) {
    if (doc.status === 'in_transit' && doc.scheduledDeliveryTime) {
        const timeUntilDelivery = doc.scheduledDeliveryTime.getTime() - Date.now();
        
        if (timeUntilDelivery > 0) {
            setTimeout(async () => {
                try {
                    await mongoose.model('Delivery').findByIdAndUpdate(
                        doc._id,
                        {
                            status: 'delivered',
                            deliveryEndTime: new Date(),
                            paymentStatus: 'completed'
                        },
                        { new: true }
                    );
                    console.log(`✅ Entrega ${doc._id} marcada como entregada automáticamente`);
                } catch (error) {
                    console.error(`❌ Error al actualizar estado de entrega ${doc._id}:`, error);
                }
            }, timeUntilDelivery);
        }
    }
});

export default mongoose.model('Delivery', deliverySchema);
