const express = require('express');

const router = express.Router();

const admissions = [
  { id: 'FTZ-1182', zone: 'Zone 44', sku: 'MCU-900', admittedQty: 1200, withdrawnQty: 975, dutyStatus: 'privileged foreign', variance: 225 },
  { id: 'FTZ-1183', zone: 'Zone 44', sku: 'SENSOR-7', admittedQty: 640, withdrawnQty: 640, dutyStatus: 'domestic', variance: 0 },
  { id: 'FTZ-1184', zone: 'Zone 19', sku: 'RADIO-21', admittedQty: 300, withdrawnQty: 240, dutyStatus: 'non-privileged foreign', variance: 60 },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      openAdmissions: admissions.filter((item) => item.variance > 0).length,
      totalVariance: admissions.reduce((sum, item) => sum + item.variance, 0),
      zones: [...new Set(admissions.map((item) => item.zone))].length,
    },
    admissions,
  });
});

router.post('/reconcile', (req, res) => {
  const admission = admissions.find((item) => item.id === req.body?.admissionId) || admissions[0];
  res.json({
    admissionId: admission.id,
    action: admission.variance > 0 ? 'prepare weekly entry adjustment' : 'mark reconciled',
    requiredDocs: ['CBP 214 admission', 'inventory ledger', 'withdrawal summary'],
  });
});

module.exports = router;
