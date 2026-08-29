import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Summary'];
const data = utils.sheet_to_json(sheet, { header: 1 });

const brands = new Set();
// Tubes start at row 14 (index 13)
const tubesRange = data.slice(13);

for (const row of tubesRange) {
    if (!row || row.length === 0) continue;
    if (typeof row[0] !== 'number') {
        if (brands.size > 0) break;
        continue;
    }
    if (row[1]) {
        brands.add(row[1]);
    }
}

console.log(JSON.stringify(Array.from(brands).sort(), null, 2));
