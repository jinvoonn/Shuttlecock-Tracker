import pkg from 'xlsx';
const { readFile, utils } = pkg;
const workbook = readFile('Shuttlecocks Money.xlsx');
const sheet = workbook.Sheets['Summary'];
const data = utils.sheet_to_json(sheet, { header: 1 });

for (let i = 0; i < 150; i++) {
    const row = data[i];
    if (row && row.length > 0 && row.some(cell => cell !== null && cell !== '')) {
        console.log(`Row ${i}: ${JSON.stringify(row)}`);
    }
}
