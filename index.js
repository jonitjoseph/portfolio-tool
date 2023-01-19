#!/usr/bin/env node

const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const figlet = require("figlet");
const { Command } = require("commander");

const CSV_FILE = 'transactions.csv';

const portfolio = {};
const portfolioValueUSD = {};

const program = new Command();

program
    .name("CPV Tool")
    .version("0.1.1")
    .description("A CLI tool for portfolio valuation")
    .option("-t, --token <value>", "Enter a token to return the latest portfolio value in USD")
    .option("-d, --date <value>", "Enter date(in dd/mm/yyyy format) to return the portfolio value per token in USD")
    .parse(process.argv);

const options = program.opts();

// main function 
main().then(() => {
    console.log('Thank You!');
});

async function main() {
    console.log(figlet.textSync("C P V Tool"));
    const currentTime = Math.floor(Date.now() / 1000);

    // executes if only token argument is provided
    if (options.token && !options.date) {
        await portfolioValue(currentTime);
        const tokenHoldings = await getPortfolioValue(options.token, null);
        if (!tokenHoldings) {
            console.log("Given token doesnot exist in portfolio!");
            return;
        }
        console.log(`Latest portfolio value for ${options.token}, current holdings ${portfolio[options.token]}, is ${tokenHoldings}`);
    }

    // executes if only date argument is provided
    if (!options.token && options.date) {
        const epochTime = await convertDate(options.date);
        if (currentTime < epochTime) {
            console.log("The given date is not valid");
            return;
        }
        await portfolioValue(epochTime);
        console.log(`Portfolio on ${options.date}`, portfolio);
        const historicalPortfolioValueUSD = await getPortfolioValueTokens(portfolio, epochTime);
        console.log(`Portfolio value on ${options.date} in USD`, historicalPortfolioValueUSD);
        const value = Object.values(historicalPortfolioValueUSD);
        const totalPortfolioWorth = value.reduce((count, val) => count + val, 0);
        console.log("Total portfolio worth", totalPortfolioWorth);
    }

    // executes if no argument is provided
    if (!options.token && !options.date) {
        await portfolioValue(currentTime);
        console.log("Current portfolio :", portfolio);
        const latestPortfolioValueUSD = await getPortfolioValueTokens(portfolio, null);
        console.log("Portfolio value in USD :", latestPortfolioValueUSD);
        const value = Object.values(latestPortfolioValueUSD);
        const totalPortfolioWorth = value.reduce((count, val) => count + val, 0);
        console.log("Total portfolio worth", totalPortfolioWorth);
    }

    // executes if both token and date argument is provided
    if (options.token && options.date) {
        const epochTime = await convertDate(options.date);
        if (currentTime < epochTime) {
            console.log("The given date is not valid");
            return;
        }
        await portfolioValue(epochTime);
        const tokenHoldings = await getPortfolioValue(options.token, epochTime);
        if (!tokenHoldings) {
            console.log("Given token doesnot exist in portfolio!");
            return;
        }
        console.log(`Historical portfolio value for ${options.token}, on ${options.date}, for holdings ${portfolio[options.token]}, is ${tokenHoldings}`);
    }
}

// function to convert the date to epoch
async function convertDate(date) {
    let dateString = date;
    let dateParts = dateString.split("/");
    if (dateParts[2] < 2030 && dateParts[1] < 13 && dateParts[0] < 32) {
        let newDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        let timestamp = newDate.getTime();
        let epochTime = Math.floor(timestamp / 1000);
        return epochTime;
    }
}

// function to read the transactions from the CSV file and update the portfolio
async function portfolioValue(epochTime) {
    try {
        const fileStream = fs.createReadStream(CSV_FILE);
        const parser = csv();
        await new Promise((resolve, reject) => {
            fileStream.on('error', reject);
            fileStream.pipe(parser);
            parser.on('data', (data) => {
                const { timestamp, transaction_type, token, amount } = data;
                if (!portfolio[token]) {
                    portfolio[token] = 0;
                }
                if (epochTime > timestamp) {
                    if (transaction_type === 'DEPOSIT') {
                        portfolio[token] += parseFloat(amount);
                    } else if (transaction_type === 'WITHDRAWAL') {
                        portfolio[token] -= parseFloat(amount);
                    }
                }
            })
            parser.on('end', resolve);
        });
    } catch (err) {
        console.error(err);
    }
    return portfolio;
}

// function to get portfolio value of all tokens in USD
async function getPortfolioValueTokens(latestPortfolio, epochTime) {
    let tokens = Object.keys(latestPortfolio);
    for (const token of tokens) {
        await getPortfolioValue(token, epochTime).then((data => {
            portfolioValueUSD[token] = data;
        }));
    }
    return portfolioValueUSD;
}

// function to get the portfolio value in USD for a given token
async function getPortfolioValue(token, epochTime) {
    let exchangeRate = 0;
    if (!epochTime) {
        exchangeRate = await getExchangeRate(token);
    } else {
        exchangeRate = await getHistoricalExchangeRate(token, epochTime);
    }
    let portfolioValueUSD = portfolio[token] * exchangeRate;
    return portfolioValueUSD;
};

// function to get the exchange rate for a given token
async function getExchangeRate(token) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`);
    return response.data.USD;
};

// function to get the historical price for a given token
async function getHistoricalExchangeRate(token, epochTime) {
    const response = await axios.get(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=${token}&tsyms=USD&ts=${epochTime}`);
    return response.data[token].USD;
};