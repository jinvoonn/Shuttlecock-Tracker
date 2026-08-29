import pkg from 'xlsx';
const { readFile, utils } = pkg;

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);
const sheet = workbook.Sheets['Records'];
const data = utils.sheet_to_json(sheet, { header: 1 });
const header = data[2];

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

// Group rows by date and count how many tube-rows exist per session
const sessions = {};
for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    const date = excelDateToDate(row[0]);
    if (!sessions[date]) sessions[date] = { tubes: [], players: new Set() };
    sessions[date].tubes.push(row[1]);
    for (let j = 5; j < header.length; j++) {
        if (row[j] === 1 || row[j] === 2) sessions[date].players.add(header[j]);
    }
}

// Show multi-tube sessions
const multiTube = Object.entries(sessions).filter(([, v]) => v.tubes.length > 1);
console.log('Sessions with MULTIPLE tubes (the bug source):');
multiTube.slice(0, 10).forEach(([date, v]) => {
    console.log(`  ${date}: tubes=[${v.tubes.join(', ')}], players=${v.players.size}`);
});
console.log(`\nTotal sessions: ${Object.keys(sessions).length}`);
console.log(`Sessions with 1 tube: ${Object.values(sessions).filter(v => v.tubes.length === 1).length}`);
console.log(`Sessions with 2+ tubes: ${multiTube.length}`);
