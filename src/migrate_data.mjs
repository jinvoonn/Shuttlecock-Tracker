import pkg from 'xlsx';
const { readFile, utils } = pkg;
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const filename = 'Shuttlecocks Money (1).xlsx';
const workbook = readFile(filename);

// 1. MAPPINGS
const PLAYER_MAP = {
    'Poi': 'Poi', 'ZT': 'Zhen Teck', 'YZ': 'Yuzhi', 'KC': 'Koo Chee', 'CJ': 'Cheng Jin',
    'HX': 'Huai Xiang', 'JZ': 'Jang Zhe', 'LW': 'Nelson', 'KY': 'Khai Yi', 'Jit Loong': 'Jit Loong',
    'Matthew': 'Matthew', 'Hau Jin': 'Hau Jin', 'Kit Liang': 'Kit Liang', 'YL': 'Yeong Ler',
    'YX': 'Yong Xin', 'ZZ': 'Zeze'
};

const BRAND_MAP = {
    'AS 50': 'Yonex AS-50', 'DimG': 'Ling Mei DimGray', 'Felet Orange': 'Felet Orange',
    'LM Black': 'Ling Mei Black', 'LM DG': 'Ling Mei DimGray', 'LM DG2': 'Ling Mei DimGray',
    'LM Orange': 'Ling Mei Orange', 'Pomax': 'Pomax', 'Pomax 2': 'Pomax',
    'Protech Plat': 'Protech Platinum', 'Protech Plat 2': 'Protech Platinum',
    'Protech Plat 3': 'Protech Platinum', 'RCL BG': 'RCL Black Gold', 'RCL BG2': 'RCL Black Gold',
    'RCL BS': 'RCL Black Silver', 'RCL BS2': 'RCL Black Silver', 'RCL T': 'RCL Titanium',
    'RSL C': 'RSL Classic', 'RSL S': 'RSL Supreme', 'RSL S Stream': 'RSL S Stream',
    'RSL Smash': 'RSL Smash'
};
for (let i = 1; i <= 22; i++) { BRAND_MAP[`RSL S${i}`] = 'RSL Supreme'; }

const TARGET_OWED = {
    'Poi': 28.89, 'ZT': 25.01, 'YZ': 0.00, 'KC': 22.87, 'CJ': 32.21,
    'HX': 17.96, 'JZ': 2.49, 'LW': 0.00, 'KY': 28.89, 'Jit Loong': 4.99,
    'Matthew': 0.00, 'Hau Jin': 0.00, 'Kit Liang': 20.45, 'YL': 16.95,
    'YX': 0.00, 'ZZ': 6.65
};

function excelDateToDate(serial) {
    if (!serial || typeof serial !== 'number') return new Date().toISOString().split('T')[0];
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

async function migrate() {
    console.log(`Starting FINAL migration from ${filename}...`);

    // 2. FETCH EXISTING DATA
    const { data: existingPlayers, error: pInfoErr } = await supabase.from('players').select('*');
    const { data: existingBrands, error: bInfoErr } = await supabase.from('brands').select('*');

    if (pInfoErr || bInfoErr) {
        console.error('Error fetching existing players/brands:', pInfoErr || bInfoErr);
    }

    const playerNameToId = Object.fromEntries((existingPlayers || []).map(p => [p.name, p.id]));
    const brandNameToId = Object.fromEntries((existingBrands || []).map(b => [b.name, b.id]));

    // 3. EXTRACT ALL BRANDS FROM SUMMARY
    const summarySheet = workbook.Sheets['Summary'];
    const summaryData = utils.sheet_to_json(summarySheet, { header: 1 });
    const tubesRange = summaryData.slice(13); // Row 14

    const brandsToCreate = new Set();
    const purchaseRows = [];

    for (const row of tubesRange) {
        if (!row || row.length === 0) continue;
        if (typeof row[0] !== 'number') {
            if (purchaseRows.length > 0) break;
            continue;
        }
        const excelBrandName = row[1];
        if (!excelBrandName || excelBrandName === 'Total') break;
        const bName = BRAND_MAP[excelBrandName] || excelBrandName;
        brandsToCreate.add(bName);

        purchaseRows.push({
            tubeNumber: row[0],
            excelBrand: excelBrandName,
            canonicalBrand: bName,
            pricePerTube: row[2] || 0,
            pricePerBall: row[3] || 0,
            initialQty: row[4] || 12,
            holder: row[6]
        });
    }

    for (const bName of brandsToCreate) {
        if (!brandNameToId[bName]) {
            const { data: bData } = await supabase.from('brands').upsert({ name: bName }).select().single();
            brandNameToId[bName] = bData.id;
        }
    }

    // 4. PLAYERS
    const recordsSheet = workbook.Sheets['Records'];
    const recordsData = utils.sheet_to_json(recordsSheet, { header: 1 });
    const recordsHeader = recordsData[2];
    const excelPlayerHeaders = recordsHeader.slice(5);

    for (const pName of excelPlayerHeaders) {
        if (!pName) continue;
        const canonicalName = PLAYER_MAP[pName] || pName;
        if (!playerNameToId[canonicalName]) {
            const { data: pData } = await supabase.from('players').upsert({ name: canonicalName }).select().single();
            playerNameToId[canonicalName] = pData.id;
        }
    }

    // 5. PURCHASES
    const tubeToId = {};
    const tubePrices = {};
    for (const p of purchaseRows) {
        const { data: pData } = await supabase.from('purchases').insert({
            brand_id: brandNameToId[p.canonicalBrand],
            purchase_date: '2023-01-01',
            initial_quantity: p.initialQty,
            remaining_quantity: p.initialQty,
            price_per_tube: p.pricePerTube,
            price_per_cock: p.pricePerBall || (p.initialQty > 0 ? p.pricePerTube / p.initialQty : 0),
            tube_number: p.tubeNumber,
            notes: `Excel Holder: ${p.holder}`
        }).select().single();
        tubeToId[p.excelBrand] = pData.id;
        tubeToId[p.tubeNumber] = pData.id;
        tubePrices[p.excelBrand] = p.pricePerBall;
        tubePrices[p.tubeNumber] = p.pricePerBall;
    }
    console.log('Purchases imported.');

    // 6. SESSIONS & COSTS TRACKING
    // FIRST PASS: Group all rows by date
    const sessionsByDate = {};
    for (const row of recordsData.slice(3)) {
        if (!row[0]) continue;
        const date = excelDateToDate(row[0]);
        if (!sessionsByDate[date]) sessionsByDate[date] = { tubeRows: [], players: new Set() };
        sessionsByDate[date].tubeRows.push(row);
        for (let i = 5; i < recordsHeader.length; i++) {
            if (row[i] === 1 || row[i] === 2) {
                const name = PLAYER_MAP[recordsHeader[i]] || recordsHeader[i];
                sessionsByDate[date].players.add(name);
            }
        }
    }

    // SECOND PASS: Insert sessions, players (once), and usage
    const playerCosts = {};
    for (const [date, session] of Object.entries(sessionsByDate)) {
        // Create session
        const { data: sData } = await supabase.from('sessions').insert({ date }).select().single();
        const sessionId = sData.id;

        // Insert session_players ONCE per session
        const attendees = [...session.players];
        for (const name of attendees) {
            await supabase.from('session_players').insert({
                session_id: sessionId,
                player_id: playerNameToId[name]
            });
        }

        // Calculate total cost for ALL tubes used in this session
        let totalSessionCost = 0;
        for (const row of session.tubeRows) {
            const tubeRef = row[1];
            const ballUsed = row[2] || 0;
            const perBall = tubePrices[tubeRef] || 0;
            totalSessionCost += ballUsed * perBall;

            // Insert session_usage per tube row
            const purchaseId = tubeToId[tubeRef];
            if (purchaseId && ballUsed > 0) {
                await supabase.from('session_usage').insert({ session_id: sessionId, purchase_id: purchaseId, quantity_used: ballUsed });

                // Set purchase date to first use
                const { data: curPurchase } = await supabase.from('purchases').select('purchase_date').eq('id', purchaseId).single();
                if (curPurchase.purchase_date === '2023-01-01' || curPurchase.purchase_date > date) {
                    await supabase.from('purchases').update({ purchase_date: date }).eq('id', purchaseId);
                }
                // Update remaining qty
                const { data: curP } = await supabase.from('purchases').select('remaining_quantity').eq('id', purchaseId).single();
                await supabase.from('purchases').update({ remaining_quantity: Math.max(0, curP.remaining_quantity - ballUsed) }).eq('id', purchaseId);
            }
        }

        // Divide TOTAL session cost evenly among unique attendees
        if (attendees.length > 0 && totalSessionCost > 0) {
            const costPerPlayer = totalSessionCost / attendees.length;
            attendees.forEach(p => playerCosts[p] = (playerCosts[p] || 0) + costPerPlayer);
        }
    }
    console.log('Sessions and costs processed.');

    // 7. INPUT CALCULATED PAYMENTS
    for (const name of Object.values(PLAYER_MAP)) {
        const cost = playerCosts[name] || 0;
        const simpleName = Object.keys(TARGET_OWED).find(k => k === name || PLAYER_MAP[k] === name);
        const owed = TARGET_OWED[simpleName] || 0;
        const paymentAmount = Math.max(0, cost - owed);

        if (paymentAmount > 0) {
            const { error: pErr } = await supabase.from('payments').insert({
                player_id: playerNameToId[name],
                amount: paymentAmount,
                date: '2025-02-01'
            });

            if (pErr) {
                console.error(`Error importing payment for ${name}:`, pErr);
            } else {
                console.log(`Payment: ${name} (RM ${paymentAmount.toFixed(2)}) imported.`);
            }
        }
    }

    console.log('Final Migration Completed Successully!');
}

migrate();
