const csv = require('csv-parser');
const axios = require('axios')
const fs = require('fs');

const CSV_FILE = 'transactions.csv';

let portfolio = {};

main().then(() => {
    console.log('Thank You!');
});

getPortfolioValue('BTC')
  .then((value) => {
    console.log(value);
  });

async function main() {
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
}

// function to get the exchange rate for a given token
async function getExchangeRate(token) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`);
    console.log(token, response.data.USD);
    return response.data.USD;
};

// function to get the portfolio value in USD for a given token
async function getPortfolioValue(token) {
    console.log(token);
    const exchangeRate = await getExchangeRate(token);
    let portfolioValueUSD = portfolio[token] * exchangeRate;
    console.log(token, portfolioValueUSD);
    return portfolioValueUSD;
};

// function to get the portfolio value in USD for a given token and date

