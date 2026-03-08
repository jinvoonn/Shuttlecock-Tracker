import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheetName = 'Total2';

if (workbook.SheetNames.includes(sheetName)) {
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    fs.writeFileSync('total2_peek.json', JSON.stringify(data.slice(0, 100), null, 2));
    console.log(`Peeked at '${sheetName}' and saved to total2_peek.json`);
} else {
    console.log(`Sheet '${sheetName}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
}
