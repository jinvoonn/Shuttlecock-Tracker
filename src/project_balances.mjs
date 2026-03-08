import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);

const PLAYER_MAP = {
    'Poi': 'Poi', 'ZT': 'Zhen Teck', 'YZ': 'Yuzhi', 'KC': 'Koo Chee', 'CJ': 'Cheng Jin',
    'HX': 'Huai Xiang', 'JZ': 'Jang Zhe', 'LW': 'Nelson', 'KY': 'Khai Yi', 'Jit Loong': 'Jit Loong',
    'Matthew': 'Matthew', 'Hau Jin': 'Hau Jin', 'Kit Liang': 'Kit Liang', 'YL': 'Yeong Ler',
    'YX': 'Yong Xin', 'ZZ': 'Zeze'
};

const BRAND_MAP = {
    'AS 50': 'Yonex AS-50', 'DimG': 'Ling Mei DimGray', 'Felet Orange': 'Felet Orange',
    'LM Black': 'Ling Mei Black', 'LM DG': 'Ling Mei DimGray', 'LM DG2': 'Ling Mei DimGray',
    'LM Orange': 'Ling Mei Orange', 'Pomax': 'Pomax', 'Pomax 2': 'Pomax',
    'Protech Plat': 'Protech Platinum', 'Protech Plat 2': 'Protech Platinum',
    'Protech Plat 3': 'Protech Platinum', 'RCL BG': 'RCL Black Gold', 'RCL BG2': 'RCL Black Gold',
    'RCL BS': 'RCL Black Silver', 'RCL BS2': 'RCL Black Silver', 'RCL T': 'RCL Titanium',
    'RSL C': 'RSL Classic', 'RSL S': 'RSL Supreme', 'RSL S Stream': 'RSL S Stream',
    'RSL Smash': 'RSL Smash'
};
// Add numbered RSL S mappings
for (let i = 1; i <= 22; i++) { BRAND_MAP[`RSL S${i}`] = 'RSL Supreme'; }

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

// 1. EXTRACT TOTAL PAYMENTS FROM TOTAL2
const total2Sheet = workbook.Sheets['Total2'];
const total2Data = utils.sheet_to_json(total2Sheet, { header: 1 });
const totalPayments = {};
for (const row of total2Data) {
    const pName = row[12];
    const amount = row[13];
    const status = row[14];
    if (pName && typeof amount === 'number' && status === true) {
        const canonical = PLAYER_MAP[pName] || pName;
        totalPayments[canonical] = (totalPayments[canonical] || 0) + amount;
    }
}

// 2. EXTRACT PURCHASES (Prices per ball)
const summarySheet = workbook.Sheets['Summary'];
const summaryData = utils.sheet_to_json(summarySheet, { header: 1 });
const tubePrices = {};
const tubesRange = summaryData.slice(13);
for (const row of tubesRange) {
    if (typeof row[0] === 'number' && row[1]) {
        const perBall = row[3] || 0;
        tubePrices[row[1]] = perBall;
        tubePrices[row[0]] = perBall;
    }
}

// 3. CALCULATE TOTAL COSTS FROM RECORDS
const recordsSheet = workbook.Sheets['Records'];
const recordsData = utils.sheet_to_json(recordsSheet, { header: 1 });
const recordsHeader = recordsData[2];
const playerCosts = {};

for (let i = 3; i < recordsData.length; i++) {
    const row = recordsData[i];
    if (!row || !row[0]) continue;

    const tubeRef = row[1];
    const ballUsed = row[2] || 0;
    const perBall = tubePrices[tubeRef] || 0;
    const sessionCost = ballUsed * perBall;

    const attendees = [];
    for (let j = 5; j < recordsHeader.length; j++) {
        if (row[j] === 1 || row[j] === 2) {
            const pName = recordsHeader[j];
            attendees.push(PLAYER_MAP[pName] || pName);
        }
    }

    if (attendees.length > 0) {
        const costPerPlayer = sessionCost / attendees.length;
        attendees.forEach(p => {
            playerCosts[p] = (playerCosts[p] || 0) + costPerPlayer;
        });
    }
}

// 4. GENERATE FINAL PROJECTION
const results = Object.keys(PLAYER_MAP).map(excelName => {
    const name = PLAYER_MAP[excelName];
    const paid = totalPayments[name] || 0;
    const cost = playerCosts[name] || 0;
    return {
        name,
        totalCost: cost.toFixed(2),
        totalPaid: paid.toFixed(2),
        balance: (paid - cost).toFixed(2)
    };
});

console.log(JSON.stringify(results, null, 2));
