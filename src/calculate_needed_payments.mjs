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

const userOwed = {
    'Poi': 28.89,
    'ZT': 25.01,
    'YZ': 0.00,
    'KC': 22.87,
    'CJ': 32.21,
    'HX': 17.96,
    'JZ': 2.49,
    'LW': 0.00,
    'KY': 28.89,
    'Jit Loong': 4.99,
    'Matthew': 0.00,
    'Hau Jin': 0.00,
    'Kit Liang': 20.45,
    'YL': 16.95,
    'YX': 0.00,
    'ZZ': 6.65
};

// 1. COSTS FROM RECORDS
const summarySheet = workbook.Sheets['Summary'];
const summaryData = utils.sheet_to_json(summarySheet, { header: 1 });
const tubePrices = {};
const tubesRange = summaryData.slice(13);
for (const row of tubesRange) {
    if (typeof row[0] === 'number' && row[1]) {
        tubePrices[row[1]] = row[3] || 0;
        tubePrices[row[0]] = row[3] || 0;
    }
}

const recordsSheet = workbook.Sheets['Records'];
const recordsData = utils.sheet_to_json(recordsSheet, { header: 1 });
const recordsHeader = recordsData[2];
const playerCosts = {};

for (let i = 3; i < recordsData.length; i++) {
    const row = recordsData[i];
    if (!row || !row[0]) continue;
    const sessionCost = (row[2] || 0) * (tubePrices[row[1]] || 0);
    const attendees = [];
    for (let j = 5; j < recordsHeader.length; j++) {
        if (row[j] === 1 || row[j] === 2) attendees.push(PLAYER_MAP[recordsHeader[j]] || recordsHeader[j]);
    }
    if (attendees.length > 0) {
        attendees.forEach(p => playerCosts[p] = (playerCosts[p] || 0) + (sessionCost / attendees.length));
    }
}

// 2. CALCULATE NEEDED PAYMENT
const inputPayments = Object.values(PLAYER_MAP).map(name => {
    // Find key in userOwed that matches name or its abbreviation
    const simpleName = Object.keys(userOwed).find(k => PLAYER_MAP[k] === name || k === name);
    const owed = userOwed[simpleName] || 0;
    const cost = playerCosts[name] || 0;

    // Paid = Cost - Owed
    const needed = Math.max(0, cost - owed);

    return {
        name,
        totalCost: cost.toFixed(2),
        targetOwed: owed.toFixed(2),
        neededPayment: needed.toFixed(2)
    };
});

console.log(JSON.stringify(inputPayments, null, 2));
