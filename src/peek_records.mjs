import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Records'];
const data = utils.sheet_to_json(sheet, { header: 1 });

// Peak at row 2 (index 1 is usually headers if row 3 is start of data)
// Actually recordsHeader was recordsData[2] in my script
fs.writeFileSync('records_peek.json', JSON.stringify(data.slice(0, 5), null, 2));
console.log('Peeked at Records headers.');
