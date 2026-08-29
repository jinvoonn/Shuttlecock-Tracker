import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Summary'];
const data = utils.sheet_to_json(sheet, { header: 1 });

data.forEach((row, i) => {
    const rowStr = JSON.stringify(row);
    if (rowStr.includes('Pomax') || rowStr.includes('RSL') || rowStr.includes('Tube')) {
        console.log(`Row ${i}: ${rowStr}`);
    }
});
