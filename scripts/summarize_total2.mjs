import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Total2'];
const data = utils.sheet_to_json(sheet, { header: 1 });

const blocks = [];
let currentBlock = null;

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    // Check for a new block header (Date serial in column A or "Pay" in column B)
    if (typeof row[0] === 'number' && row[0] > 40000) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
            date: excelDateToDate(row[0]),
            startRow: i + 1,
            payments: []
        };
    }

    // This sheet has very irregular structure. Let's look for "true" in column O (index 14)
    // and a player name in column M (index 12)
    const pName = row[12];
    const amount = row[13];
    const status = row[14];

    if (pName && typeof amount === 'number' && status === true) {
        if (!currentBlock) {
            // Block 1 doesn't have a date in A1, it's just the start of the sheet
            currentBlock = { date: 'Historical (Batch 1)', startRow: 1, payments: [] };
        }
        currentBlock.payments.push({ player: pName, amount });
    }
}
if (currentBlock) blocks.push(currentBlock);

console.log(JSON.stringify(blocks, null, 2));
