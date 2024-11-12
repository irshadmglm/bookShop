const express = require('express');
const salesReportController = require('../../controllers/admin/salesReportController');
const router = express.Router();


router.get('/', salesReportController.getDashboardData);

router.post('/sales-report/day', salesReportController.getDailyReport);

router.post('/sales-report/week', salesReportController.getWeeklyReport);

router.post('/sales-report/month', salesReportController.getMonthlyReport);

router.post('/sales-report/custom', salesReportController.getCustomDateReport);

router.get('/download/pdf', salesReportController.downloadPdfReport);

router.get('/download/excel', salesReportController.downloadExcelReport);

module.exports = router;
