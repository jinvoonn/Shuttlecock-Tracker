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

const total2Sheet = workbook.Sheets['Total2'];
const total2Data = utils.sheet_to_json(total2Sheet, { header: 1 });

const totalPaidSettled = {};
const previousUnpaid = {};

for (const row of total2Data) {
    const pName = row[12];
    const amount = row[13];
    const status = row[14];
    const prev = row[8];
    if (pName) {
        const name = PLAYER_MAP[pName] || pName;
        if (typeof amount === 'number' && status === true) {
            totalPaidSettled[name] = (totalPaidSettled[name] || 0) + amount;
        }
        if (typeof prev === 'number' && prev > 0) {
            previousUnpaid[name] = prev;
        }
    }
}

// 2. COSTS FROM RECORDS
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

// 3. FINAL PROJECTED BALANCES
const results = Object.values(PLAYER_MAP).map(name => {
    const cost = playerCosts[name] || 0;
    const paid = totalPaidSettled[name] || 0;
    const prev = previousUnpaid[name] || 0;
    // The the user says "if they appear in previous, they haven't paid up on prior sessions"
    // So the net balance should be (Total Paid) - (Total Cost) - (Previous Unpaid)
    // Actually, usually "Previous" in these sheets is the Balance brought forward.
    // Let's assume the final balance is: Paid - Cost - Previous. (If Previous is an outstanding debt)
    return {
        name,
        totalCost: cost.toFixed(2),
        totalPaid: paid.toFixed(2),
        previousDebt: prev.toFixed(2),
        finalBalance: (paid - cost - prev).toFixed(2)
    };
});

console.log(JSON.stringify(results, null, 2));
