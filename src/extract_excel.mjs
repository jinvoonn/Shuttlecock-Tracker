import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filePath = 'c:/Users/jinvo/OneDrive/Documents/Antigravity/Shuttlecocks/shuttle-tracker/Shuttlecocks Money.xlsx';
const workbook = readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

// Get first 3 sheets
const sheetsToExtract = workbook.SheetNames.slice(0, 3);

sheetsToExtract.forEach((name, index) => {
    console.log(`\n--- Sheet ${index + 1}: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const data = utils.sheet_to_json(sheet, { header: 1 });

    // Print headers and first 10 rows
    data.slice(0, 15).forEach((row, i) => {
        console.log(`Row ${i}:`, JSON.stringify(row));
    });
});
