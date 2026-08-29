import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const result = {};

workbook.SheetNames.slice(0, 3).forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    result[sheetName] = data.slice(0, 100); // More rows to be safe
});

fs.writeFileSync('new_excel_peek.json', JSON.stringify(result, null, 2));
console.log('Peeked at new excel file and saved to new_excel_peek.json');
