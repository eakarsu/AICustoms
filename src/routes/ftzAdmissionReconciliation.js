const express = require('express');

const router = express.Router();

const admissions = [
  { id: 'FTZ-1182', zone: 'Zone 44', sku: 'MCU-900', admittedQty: 1200, withdrawnQty: 975, dutyStatus: 'privileged foreign', variance: 225 },
  { id: 'FTZ-1183', zone: 'Zone 44', sku: 'SENSOR-7', admittedQty: 640, withdrawnQty: 640, dutyStatus: 'domestic', variance: 0 },
  { id: 'FTZ-1184', zone: 'Zone 19', sku: 'RADIO-21', admittedQty: 300, withdrawnQty: 240, dutyStatus: 'non-privileged foreign', variance: 60 },
  { id: 'FTZ-1185', zone: 'Zone 44', sku: 'VALVE-14', admittedQty: 500, withdrawnQty: 450, dutyStatus: 'privileged foreign', variance: 50 },
  { id: 'FTZ-1186', zone: 'Zone 19', sku: 'PUMP-32', admittedQty: 260, withdrawnQty: 260, dutyStatus: 'domestic', variance: 0 },
  { id: 'FTZ-1187', zone: 'Zone 44', sku: 'CABLE-08', admittedQty: 900, withdrawnQty: 820, dutyStatus: 'non-privileged foreign', variance: 80 },
  { id: 'FTZ-1188', zone: 'Zone 12', sku: 'MOTOR-16', admittedQty: 180, withdrawnQty: 150, dutyStatus: 'privileged foreign', variance: 30 },
  { id: 'FTZ-1189', zone: 'Zone 19', sku: 'FILTER-25', admittedQty: 720, withdrawnQty: 700, dutyStatus: 'domestic', variance: 20 },
  { id: 'FTZ-1190', zone: 'Zone 12', sku: 'GAUGE-11', admittedQty: 340, withdrawnQty: 300, dutyStatus: 'non-privileged foreign', variance: 40 },
  { id: 'FTZ-1191', zone: 'Zone 44', sku: 'SENSOR-12', admittedQty: 610, withdrawnQty: 610, dutyStatus: 'privileged foreign', variance: 0 },
  { id: 'FTZ-1192', zone: 'Zone 19', sku: 'RELAY-06', admittedQty: 430, withdrawnQty: 390, dutyStatus: 'domestic', variance: 40 },
  { id: 'FTZ-1193', zone: 'Zone 12', sku: 'BRACKET-9', admittedQty: 800, withdrawnQty: 740, dutyStatus: 'non-privileged foreign', variance: 60 },
  { id: 'FTZ-1194', zone: 'Zone 44', sku: 'BOARD-22', admittedQty: 220, withdrawnQty: 205, dutyStatus: 'privileged foreign', variance: 15 },
  { id: 'FTZ-1195', zone: 'Zone 12', sku: 'FAN-17', admittedQty: 390, withdrawnQty: 350, dutyStatus: 'domestic', variance: 40 },
  { id: 'FTZ-1196', zone: 'Zone 19', sku: 'CONNECTOR-4', admittedQty: 1050, withdrawnQty: 960, dutyStatus: 'non-privileged foreign', variance: 90 },
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
