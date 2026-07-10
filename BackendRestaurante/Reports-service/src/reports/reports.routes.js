import { Router } from 'express';
import * as reportsController from './reports.controller.js';

const router = Router();

router.post('/', reportsController.createReport);
router.get('/', reportsController.getReports);
router.get('/stats', reportsController.getReportStats);
router.get('/:id', reportsController.getReportById);
router.put('/:id', reportsController.updateReport);
router.patch('/:id/archive', reportsController.archiveReport);
router.delete('/:id', reportsController.deleteReport);

export default router;
