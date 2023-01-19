# CHANGELOG
## version 0.0.1
- added dummy CSV file with transactions
- added function to calculate current portfolio value

## version 0.0.2
- added axios to fetch the API data
- added function to fetch exchange rate for a given token
- added function to derive the portfolio value from the exchange rate and portfolio token balance

## version 0.0.3
- added commander to display cli options

## version 0.0.4
- updated checks for commander cli options
- moved csv read to function

## version 0.0.5
- updated code block if both token and date argument provided
- updated portfolioValue to parse csv to accept epochTime argument
- updated getPortfolioValue to accept epochTime argument
- added getHistoricalExchangeRate function to fetch historical prices for token on given timestamp
- added current time variable

## version 0.0.6
- resolved the daly in csv parsing
- updated getHistoricalExchangeRate function 

## version 0.0.7
- added convertDate function to convert date to epoch
- added getLatestPortfolioValue function to push latest portfolio value to variable

## version 0.0.8
- added figlet to diplay tool name in cli
- added #! to execute the script from cli
- added some checks for date
- added bin in package.json to make script globally avaliable
- updated function name of getLatestPortfolioValue to getPortfolioValueTokens