const csv = require('csv-parser');
const axios = require('axios')
const fs = require('fs');
const { Command } = require("commander");

const CSV_FILE = 'transactions.csv';

let portfolio = {};

const program = new Command();

program
    .name("CPV Tool")
    .version("1.0.0")
    .description("A CLI tool for portfolio valuation")
    .option("-t, --token <value>", "Enter a token to return the latest portfolio value in USD")
    .option("-d, --date <value>", "Enter date(in dd/mm/yyyy format) to return the portfolio value per token in USD")
    .parse(process.argv);

const options = program.opts();

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


    // executes if only token argument is provided
    if (options.token) {
        console.log("only token arg");
    }

    // executes if only date argument is provided
    if (options.date) {
        console.log("only date arg");
    }

    // executes if no argument is provided
    console.log("no argument");

    // executes if both date and token argument is provided
    console.log("both argument");
}

// function to get the exchange rate for a given token
async function getExchangeRate(token) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`);
    // console.log(token, response.data.USD);
    return response.data.USD;
};

// function to get the portfolio value in USD for a given token
async function getPortfolioValue(token) {
    // console.log(token);
    const exchangeRate = await getExchangeRate(token);
    let portfolioValueUSD = portfolio[token] * exchangeRate;
    // console.log(token, portfolioValueUSD);
    return portfolioValueUSD;
};

// function to get the portfolio value in USD for a given token and date

