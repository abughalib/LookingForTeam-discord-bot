CREATE TABLE IF NOT EXISTS channelIds(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId VARCHAR(255) NOT NULL,
    channelType VARCHAR(50) NOT NULL,
    channelName varchar(50) NOT NULL,
    UNIQUE(channelId)
);