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

const playerTotals = {};
const previousUnpaid = {};

for (let i = 0; i < total2Data.length; i++) {
    const row = total2Data[i];
    if (!row) continue;

    const pName = row[12]; // Column M
    const amount = row[13]; // Column N
    const status = row[14]; // Column O
    const prevAmount = row[8]; // Column I (Previous)

    if (pName) {
        const canonical = PLAYER_MAP[pName] || pName;

        // Sum settled payments
        if (typeof amount === 'number' && status === true) {
            playerTotals[canonical] = (playerTotals[canonical] || 0) + amount;
        }

        // Track 'Previous' unpaid amounts - we need the MOST RECENT one typically, 
        // as it usually carries over the balance. Let's look for the last non-null entry in column I.
        if (typeof prevAmount === 'number' && prevAmount > 0) {
            previousUnpaid[canonical] = prevAmount;
        }
    }
}

// Just printing the values for now to understand the scale
console.log("--- Aggregate Settled Payments ---");
console.log(JSON.stringify(playerTotals, null, 2));

console.log("\n--- 'Previous' Unpaid Balances Found ---");
console.log(JSON.stringify(previousUnpaid, null, 2));
