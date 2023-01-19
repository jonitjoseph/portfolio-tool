# CPV Tool
A CLI tool for portfolio valuation of crypto investments/transactions logged in a CSV file. The program accepts user options to perform predefined tasks and produce the results.
## Getting Started
The following instructions will guide you to clone the project, install the dependencies and globally install the program to access it anywhere from the CLI.
## Requirements
- [NodeJS v16](https://nodejs.org/en/)
## Installation
- Make sure you have NodeJS and npm installed on your system.
- Clone the repository and navigate to the root directory of the project.
- Run `npm install` to install the required dependencies.
- Run `npm install -g .` to install the CLI tool globally in your terminal. This will let you access the application anywhere in the CLI with 'cpvtool' command.
## Usage
This tool can be run with the following command anywhere in the CLI.
```
cpvtool
```
## Options
- `-V` or `--version` : Output the version number of the tool.
- `-t` or `--token` : Enter a token to return the latest portfolio value in USD.
- `-d` or `--date` : Enter date(in dd/mm/yyyy format) to return the portfolio value per token in USD.
- `-h` or `--help` : Display help for commands.
## Example
- To get the latest portfolio value in USD for all tokens:
```
cpvtool
```
- To get the latest portfolio value in USD for a specific token:
```
cpvtool -t BTC
```
- To get the portfolio value in USD for all tokens on a specific date:
```
cpvtool -d 01/01/2021
```
- To get the portfolio value in USD for a specific token on a specific date:
```
cpvtool -t BTC -d 01/01/2021
```
## CSV File
The CSV file with the crypto investments/transactions should be named `transactions.csv` and should be located in the same directory as the script. Each line in the CSV file should represent a transaction and should contain the following columns,
- timestamp
- transaction_type
- token
- amount
The example format is as shown below,
```
timestamp,transaction_type,token,amount
1623421567,DEPOSIT,BTC,0.5
1623422123,DEPOSIT,ETH,2.4
1623422234,DEPOSIT,LTC,1.0
1624451349,WITHDRAWAL,BTC,0.2
1630585741,WITHDRAWAL,ETH,0.4
```
## Notes
- The program uses the CryptoCompare API to get the prices for the tokens. For more details visit [CryptoCompare](https://min-api.cryptocompare.com/documentation).
- Make sure to install script globally with `npm install -g .` commmand.
- The date input should be entered in the format dd/mm/yyyy.
- The CSV file should be in the same directory as the script with filename `transactions.csv`.
## Dependencies
- axios: version 1.2.2
- commander: version 10.0.0
- csv-parser: version 3.0.0
- figlet: version 1.5.2
### Author
[Jonit Joseph](https://github.com/jonitjoseph)