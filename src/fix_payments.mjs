import pkg from 'xlsx';
const { readFile, utils } = pkg;
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);

const PLAYER_MAP = {
    'Poi': 'Poi', 'ZT': 'Zhen Teck', 'YZ': 'Yuzhi', 'KC': 'Koo Chee', 'CJ': 'Cheng Jin',
    'HX': 'Huai Xiang', 'JZ': 'Jang Zhe', 'LW': 'Nelson', 'KY': 'Khai Yi', 'Jit Loong': 'Jit Loong',
    'Matthew': 'Matthew', 'Hau Jin': 'Hau Jin', 'Kit Liang': 'Kit Liang', 'YL': 'Yeong Ler',
    'YX': 'Yong Xin', 'ZZ': 'Zeze'
};

const TARGET_OWED = {
    'Poi': 28.89, 'ZT': 25.01, 'YZ': 0.00, 'KC': 22.87, 'CJ': 32.21,
    'HX': 17.96, 'JZ': 2.49, 'LW': 0.00, 'KY': 28.89, 'Jit Loong': 4.99,
    'Matthew': 0.00, 'Hau Jin': 0.00, 'Kit Liang': 20.45, 'YL': 16.95,
    'YX': 0.00, 'ZZ': 6.65
};

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    return new Date((serial - 25569) * 86400 * 1000).toISOString().split('T')[0];
}

async function fixPayments() {
    // 1. Fetch players
    const { data: players } = await supabase.from('players').select('*');
    const playerNameToId = Object.fromEntries((players || []).map(p => [p.name, p.id]));

    // 2. Calculate correct costs using grouped-by-date logic (same as fixed migrate_data.mjs)
    const summarySheet = workbook.Sheets['Summary'];
    const summaryData = utils.sheet_to_json(summarySheet, { header: 1 });
    const tubePrices = {};
    for (const row of summaryData.slice(13)) {
        if (typeof row[0] === 'number' && row[1] && row[1] !== 'Total') {
            tubePrices[row[1]] = row[3] || 0;
            tubePrices[row[0]] = row[3] || 0;
        }
    }

    const recordsSheet = workbook.Sheets['Records'];
    const recordsData = utils.sheet_to_json(recordsSheet, { header: 1 });
    const recordsHeader = recordsData[2];

    // Group by date
    const sessionsByDate = {};
    for (const row of recordsData.slice(3)) {
        if (!row[0]) continue;
        const date = excelDateToDate(row[0]);
        if (!sessionsByDate[date]) sessionsByDate[date] = { tubeRows: [], players: new Set() };
        sessionsByDate[date].tubeRows.push(row);
        for (let i = 5; i < recordsHeader.length; i++) {
            if (row[i] === 1 || row[i] === 2) {
                sessionsByDate[date].players.add(PLAYER_MAP[recordsHeader[i]] || recordsHeader[i]);
            }
        }
    }

    // Calculate costs
    const playerCosts = {};
    for (const session of Object.values(sessionsByDate)) {
        const attendees = [...session.players];
        let totalCost = 0;
        for (const row of session.tubeRows) {
            totalCost += (row[2] || 0) * (tubePrices[row[1]] || 0);
        }
        if (attendees.length > 0 && totalCost > 0) {
            const costPP = totalCost / attendees.length;
            attendees.forEach(p => playerCosts[p] = (playerCosts[p] || 0) + costPP);
        }
    }

    // 3. Delete all existing payments using IDs
    const { data: allPayments } = await supabase.from('payments').select('id');
    if (allPayments && allPayments.length > 0) {
        const ids = allPayments.map(p => p.id);
        const { error: delErr } = await supabase.from('payments').delete().in('id', ids);
        if (delErr) { console.error('Delete failed:', delErr); return; }
    }
    console.log('Old payments deleted.');

    // 4. Re-insert correct payments
    for (const name of Object.values(PLAYER_MAP)) {
        const cost = playerCosts[name] || 0;
        const excelKey = Object.keys(TARGET_OWED).find(k => PLAYER_MAP[k] === name || k === name);
        const owed = TARGET_OWED[excelKey] || 0;
        const payment = Math.max(0, cost - owed);

        if (payment > 0) {
            const { error } = await supabase.from('payments').insert({
                player_id: playerNameToId[name],
                amount: payment,
                date: '2025-02-01'
            });
            if (error) console.error(`Error for ${name}:`, error);
            else console.log(`Payment: ${name} → RM ${payment.toFixed(2)} (owed: ${owed})`);
        }
    }
    console.log('Done!');
}

fixPayments();
