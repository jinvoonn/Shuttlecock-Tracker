import pkg from 'xlsx';
const { readFile, utils } = pkg;
const workbook = readFile('Shuttlecocks Money.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[1]];
const data = utils.sheet_to_json(sheet, { header: 1 });
data.slice(0, 30).forEach((row, i) => console.log(`Row ${i}:`, JSON.stringify(row)));
