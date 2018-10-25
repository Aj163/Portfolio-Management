CREATE DATABASE Portfolio;
USE Portfolio;

-- ###########################################################################

CREATE TABLE User (
	UserID INT PRIMARY KEY AUTO_INCREMENT,
	Username VARCHAR(50) UNIQUE NOT NULL,
	Password VARCHAR(50),
	FirstName VARCHAR(50) NOT NULL,
	LastName VARCHAR(50)
);

CREATE TABLE Shares (
	Symbol VARCHAR(50) PRIMARY KEY,
	ShareName VARCHAR(100) NOT NULL,
	Information VARCHAR(2000)
);

CREATE TABLE Currency (
	Abbreviation VARCHAR(50) PRIMARY KEY,
	CurrencyName VARCHAR(100) NOT NULL,
);

-- ###########################################################################

CREATE TABLE ShareHistory (
	TimeLog TIMESTAMP,
	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
	Price FLOAT(7, 2) NOT NULL CHECK (CurrentPrice > 0),
	CONSTRAINT primeKey PRIMARY KEY (ShareSymbol, TimeLog)
);

CREATE TABLE WatchList (
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT primeKey PRIMARY KEY (UserID, ShareSymbol)
);

CREATE TABLE BuyShare (
	TimeLog TIMESTAMP,
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	Quantity INT CHECK (Quantity > 0),
	Price FLOAT,
	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog)
);

CREATE TABLE SellShare (
	TimeLog TIMESTAMP,
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	Quantity INT CHECK (Quantity > 0),
	Price FLOAT,
	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog)
);

-- CREATE TABLE CurrentShares (
-- 	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
-- 	Quantity INT CHECK (Quantity > 0),
-- 	Invested FLOAT NOT NULL,
-- 	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
-- 	CONSTRAINT primeKey PRIMARY KEY (UserID, ShareSymbol)
-- );

-- BuySellFlag = 0 => Buy
-- BuySellFlag = 1 => Sell
CREATE TABLE UserHistory (
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	Quantity INT CHECK (Quantity > 0),
	TimeLog TIMESTAMP,
	Price FLOAT NOT NULL,
	BuySellFlag INT CHECK (BuySellFlag = 0 OR BuySellFlag = 1),
	ShareSymbol VARCHAR(50) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog)
);

CREATE TABLE CurrencyHistory (
	Abbreviation VARCHAR(50) REFERENCES Currency(Abbreviation) ON DELETE CASCADE ON UPDATE CASCADE,
	TimeLog TIMESTAMP,
	PriceInUSD FLOAT(7, 2) NOT NULL CHECK (PriceInUSD > 0),
	CONSTRAINT primeKey PRIMARY KEY (Abbreviation, TimeLog)
);

CREATE TABLE CurrencyExchange (
	TimeLog TIMESTAMP,
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	FromCurrency VARCHAR(50) REFERENCES Currency(Abbreviation) ON DELETE CASCADE ON UPDATE CASCADE,
	ToCurrency VARCHAR(50) REFERENCES Currency(Abbreviation) ON DELETE CASCADE ON UPDATE CASCADE,
	FromAmount FLOAT(7, 2) NOT NULL CHECK (FromAmount > 0),
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog)
);

CREATE TABLE UserCurrencies (
	UserID INT REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	CurrencyName VARCHAR(50) REFERENCES Currency(Abbreviation) ON DELETE CASCADE ON UPDATE CASCADE,
	Amount FLOAT(7, 2) NOT NULL CHECK (Amount > 0)
);

-- ###########################################################################
-- Deleting all tables

-- DROP TABLE User;
-- DROP TABLE Shares;
-- DROP TABLE Currency;
-- DROP TABLE ShareHistory;
-- DROP TABLE WatchList;
-- DROP TABLE BuyShare;
-- DROP TABLE SellShare;
-- DROP TABLE CurrentShares;
-- DROP TABLE UserHistory;
-- DROP TABLE CurrencyHistory;
-- DROP TABLE CurrencyExchange;
-- DROP TABLE UserCurrencies;