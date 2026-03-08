import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Total2'];
const data = utils.sheet_to_json(sheet, { header: 1 });

const playerTotals = {};

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

console.log('--- Settlement Batches and Player Balances ---');

let currentBatchDate = null;

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    // Detect new batch by date serial in first column
    if (typeof row[0] === 'number' && row[0] > 40000) {
        currentBatchDate = excelDateToDate(row[0]);
    }

    const pName = row[12]; // Column M
    const amount = row[13]; // Column N
    const status = row[14]; // Column O

    if (pName && typeof amount === 'number' && status === true) {
        if (!playerTotals[pName]) playerTotals[pName] = 0;
        playerTotals[pName] += amount;
    }
}

console.log(JSON.stringify(playerTotals, null, 2));

// Quick check of sessions after Feb 1st
const recordsSheet = workbook.Sheets['Records'];
const recordsData = utils.sheet_to_json(recordsSheet, { header: 1 });
const cutoffDate = '2025-02-01'; // Roughly 1/2 batch date
let sessionsAfter = 0;

for (let i = 3; i < recordsData.length; i++) {
    const row = recordsData[i];
    if (row && row[0]) {
        if (excelDateToDate(row[0]) > cutoffDate) {
            sessionsAfter++;
        }
    }
}
console.log(`\nSessions after ${cutoffDate}: ${sessionsAfter}`);
