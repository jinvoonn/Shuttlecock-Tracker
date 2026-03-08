import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Summary'];
const data = utils.sheet_to_json(sheet, { header: 1 });

fs.writeFileSync('summary_peek.json', JSON.stringify(data.slice(13, 100), null, 2));
console.log('Peeked at Summary prices.');
