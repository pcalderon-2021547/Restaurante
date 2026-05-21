import { Router } from 'express';
import {
    getGeneralStats,
    getTopDishes,
    getPeakHours,
    getRestaurantStats,
    getDemandReport,
    sendGeneralStatsPDF,
    sendRestaurantStatsPDF,
    sendTopDishesPDF,
    sendGeneralStatsExcel,
    sendRestaurantStatsExcel,
    sendTopDishesExcel,
    sendDemandExcel
} from './reports_controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/reports/stats/general:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales
 */

/**
 * @swagger
 * /restaurantManagement/v1/reports/send-pdf/general/{email}:
 *   get:
 *     summary: Enviar reporte general por PDF al correo
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF enviado correctamente
 */

// ── ESTADÍSTICAS JSON (para gráficos en frontend) ─────────────────────────────

/**
 * GET /reports/stats/general   
 * Totales del sistema: restaurantes, órdenes, reservaciones, ingresos, rating global
 */
router.get('/stats/general', validateJWT, requireRole('ADMIN_ROLE'), getGeneralStats);

/**
 * GET /reports/stats/top-dishes?limit=10&restaurantId=xxx
 * Platillos más vendidos (global o por restaurante)
 */
router.get('/stats/top-dishes', validateJWT, requireRole('ADMIN_ROLE'), getTopDishes);

/**
 * GET /reports/stats/peak-hours?restaurantId=xxx
 * Horas pico por volumen de órdenes
 */
router.get('/stats/peak-hours', validateJWT, requireRole('ADMIN_ROLE'), getPeakHours);

/**
 * GET /reports/stats/restaurant/:restaurantId
 * Estadísticas detalladas de UN restaurante: ingresos, ocupación, pedidos/día, satisfacción
 */
router.get('/stats/restaurant/:restaurantId', validateJWT, requireRole('ADMIN_ROLE'), getRestaurantStats);

/**
 * GET /reports/stats/demand?from=YYYY-MM-DD&to=YYYY-MM-DD&restaurantId=xxx
 * Demanda por rango de fechas: órdenes/día, reservaciones/día, ingresos/día
 */
router.get('/stats/demand', validateJWT, requireRole('ADMIN_ROLE'), getDemandReport);

// ── REPORTES PDF → CORREO (solo ADMIN) ───────────────────────────────────────

/**
 * GET /reports/send-pdf/general/:email
 * Envía PDF con las estadísticas generales del sistema completo
 */
router.get('/send-pdf/general/:email', validateJWT, requireRole('ADMIN_ROLE'), sendGeneralStatsPDF);

/**
 * GET /reports/send-pdf/restaurant/:restaurantId/:email
 * Envía PDF con el reporte de desempeño de UN restaurante específico
 */
router.get('/send-pdf/restaurant/:restaurantId/:email', validateJWT, requireRole('ADMIN_ROLE'), sendRestaurantStatsPDF);

/**
 * GET /reports/send-pdf/top-dishes/:email?limit=10&restaurantId=xxx
 * Envía PDF con el ranking de platillos más vendidos
 */
router.get('/send-pdf/top-dishes/:email', validateJWT, requireRole('ADMIN_ROLE'), sendTopDishesPDF);

// ── REPORTES EXCEL → CORREO (solo ADMIN) ─────────────────────────────────────

/**
 * GET /reports/send-excel/general/:email
 * Envía Excel con estadísticas generales del sistema completo
 */
router.get('/send-excel/general/:email', validateJWT, requireRole('ADMIN_ROLE'), sendGeneralStatsExcel);

/**
 * GET /reports/send-excel/restaurant/:restaurantId/:email
 * Envía Excel con 3 hojas del restaurante: Resumen, Top Platillos, Órdenes por Día
 */
router.get('/send-excel/restaurant/:restaurantId/:email', validateJWT, requireRole('ADMIN_ROLE'), sendRestaurantStatsExcel);

/**
 * GET /reports/send-excel/top-dishes/:email?limit=10&restaurantId=xxx
 * Envía Excel con ranking de platillos más vendidos
 */
router.get('/send-excel/top-dishes/:email', validateJWT, requireRole('ADMIN_ROLE'), sendTopDishesExcel);

/**
 * GET /reports/send-excel/demand/:email?from=YYYY-MM-DD&to=YYYY-MM-DD&restaurantId=xxx
 * Envía Excel con demanda diaria: órdenes, reservaciones e ingresos por fecha
 */
router.get('/send-excel/demand/:email', validateJWT, requireRole('ADMIN_ROLE'), sendDemandExcel);

export default router;
