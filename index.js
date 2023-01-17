const csv = require('csv-parser');
const fs = require('fs');

const CSV_FILE = 'transactions.csv';

let portfolio = {};

// read the transactions from the CSV file and update the portfolio
fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (data) => {
        const { timestamp, transaction_type, token, amount } = data;
        if (!portfolio[token]) {
            portfolio[token] = 0;
        }
        if (transaction_type === 'DEPOSIT') {
            portfolio[token] += parseFloat(amount);
        } else if (transaction_type === 'WITHDRAWAL') {
            portfolio[token] -= parseFloat(amount);
        }
    })
    .on('end', () => {
        console.log(portfolio);
    });