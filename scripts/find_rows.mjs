import pkg from 'xlsx';
const { readFile, utils } = pkg;
const workbook = readFile('Shuttlecocks Money.xlsx');
const sheet = workbook.Sheets['Summary'];
const data = utils.sheet_to_json(sheet, { header: 1 });

data.forEach((row, i) => {
    const rowStr = JSON.stringify(row);
    if (rowStr.includes('Tube') || rowStr.includes('Poi') || rowStr.includes('Pomax')) {
        console.log(`Row ${i}: ${rowStr}`);
    }
});
