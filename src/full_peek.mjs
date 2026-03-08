import pkg from 'xlsx';
import { writeFileSync } from 'fs';
const { readFile, utils } = pkg;
const workbook = readFile('Shuttlecocks Money.xlsx');

const results = {};

workbook.SheetNames.slice(0, 3).forEach((name, index) => {
    const sheet = workbook.Sheets[name];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    results[name] = data.slice(0, 50); // Take first 50 rows for analysis
});

writeFileSync('excel_peeks.json', JSON.stringify(results, null, 2));
console.log('Peeks saved to excel_peeks.json');
