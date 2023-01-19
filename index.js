const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios')
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

async function main() {
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("now", currentTime);

    // executes if only token argument is provided
    if (options.token && !options.date) {
        console.log("only token arg");
        await portfolioValue(currentTime);
        const tokenHoldings = await getPortfolioValue(options.token, null)
        console.log(`Latest portfolio value for ${options.token}, current holdings ${portfolio[options.token]}, is ${tokenHoldings}`);
    }

    // executes if only date argument is provided
    if (!options.token && options.date) {
        console.log("only date arg");
        let dateString = options.date;
        let dateParts = dateString.split("/");
        // add check for the month value not greater than 12 and date not greater than 31
        let date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        let timestamp = date.getTime();
        let epochTime = Math.floor(timestamp / 1000);
        if (currentTime > epochTime) {
            console.log(epochTime);
        }
        await portfolioValue(epochTime);
        console.log("portfolio", portfolio);
        // to do
        // get old portfolio holding and corresponding exchange rate on that day
    }

    // executes if no argument is provided
    if (!options.token && !options.date) {
        console.log("no argument");
        await portfolioValue(currentTime);
        console.log("Current portfolio :", portfolio);
        // to do
        // get latest portfolio value in usd
    }

    // executes if both token and date argument is provided
    if (options.token && options.date) {
        console.log("both argument");
        let dateString = options.date;
        let dateParts = dateString.split("/");
        // add check for the month value not greater than 12 and date not greater than 31
        let date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        let timestamp = date.getTime();
        let epochTime = Math.floor(timestamp / 1000);
        if (currentTime > epochTime) {
            console.log(epochTime);
        }
        await portfolioValue(epochTime);
        console.log("portfolio", portfolio);
        console.log("portfolio for ", portfolio[options.token]);
        const tokenHoldings = await getPortfolioValue(options.token, epochTime)
        console.log(`Historical portfolio value for ${options.token}, holdings ${portfolio[options.token]}, is ${tokenHoldings}`);
    }
}

// read the transactions from the CSV file and update the portfolio
async function portfolioValue(epochTime) {
    console.log(epochTime);
    fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (data) => {
            const { timestamp, transaction_type, token, amount } = data;
            if (!portfolio[token]) {
                portfolio[token] = 0;
            }
            console.log(timestamp);
            if (epochTime > timestamp) {
                if (transaction_type === 'DEPOSIT') {
                    portfolio[token] += parseFloat(amount);
                    // console.log("dep",portfolio[token]);
                } else if (transaction_type === 'WITHDRAWAL') {
                    portfolio[token] -= parseFloat(amount);
                    // console.log("with",portfolio[token]);
                }
            }
        })
        .on('end', () => {
            console.log(portfolio);
        });
}

// function to get the portfolio value in USD for a given token
async function getPortfolioValue(token, epochTime) {
    // console.log(token,epochTime);
    let exchangeRate = 0;
    if (!epochTime) {
        exchangeRate = await getExchangeRate(token);
    } else {
        exchangeRate = await getHistoricalExchangeRate(token, epochTime);
    }
    let portfolioValueUSD = portfolio[token] * exchangeRate;
    // console.log(token, portfolioValueUSD);
    return portfolioValueUSD;
};

// function to get the exchange rate for a given token
async function getExchangeRate(token) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`);
    // console.log(token, response.data.USD);
    return response.data.USD;
};

// function to get the historical price for a given token
async function getHistoricalExchangeRate(token, epochTime) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=${token}&tsyms=USD&ts=${epochTime}`);
    // console.log(token, response.data[token].USD);
    return response.data.USD;
};