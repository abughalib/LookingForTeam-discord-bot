import sqlite3 from "sqlite3";
import { ISqlite, open } from "sqlite";

/*
CREATE TABLE channelIds IF NOT EXISTS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId VARCHAR(255) NOT NULL,
    channelType VARCHAR(50) NOT NULL,
    channelName varchar(50) NOT NULL,
    UNIQUE(channelId)
);

Channel Info from database schema
*/

interface ChannelInfo {
  id: number;
  channelId: string;
  channelType: string;
  channelName: string;
}

class DatabaseOperation {
  // Get Database connection
  async getDatabase() {
    const db = await open({
      filename: "../database.db",
      driver: sqlite3.Database,
    });
    return db;
  }

  // Get channelInfo from database using channelId
  async getChannelInfo(channelId: string): Promise<ChannelInfo | string> {
    const db = await this.getDatabase();
    const channel: ChannelInfo | undefined = await db.get(
      `SELECT * FROM channelIds WHERE channelId = '${channelId}'`
    );

    if (!channel) {
      return "Channel Not Found";
    }

    return channel;
  }

  // Insert channelInfo into database
  async addChannelInfo(
    channelId: string,
    channelType: string,
    channelName: string
  ): Promise<string> {
    const db = await this.getDatabase();
    // let resp = await db.run(
    //   `INSERT INTO channelIds(channelId, channelType, channelName) VALUES('${channelId}', '${channelType}', '${channelName}')`
    // );
    let resp: ISqlite.RunResult<sqlite3.Statement>;
    try {
      resp = await db.run(
        `INSERT INTO channelIds(channelId, channelType, channelName) VALUES('${channelId}', '${channelType}', '${channelName}')`
      );
    } catch (error: any) {
      // If no changes made then return Error Massage

      if (error.errno === 19) {
        return "Channel Already Exists";
      } else {
        return "Error Occured: " + error.code;
      }
    }
    return "Channel Added Successfully";
  }

  // Update channelInfo to database
  async updateChannelInfo(
    channelId: string,
    channelType: string,
    channelName: string
  ): Promise<string> {
    let db = await this.getDatabase();
    let resp = await db.run(
      `UPDATE channelIds SET channelType = '${channelType}', channelName = '${channelName}' WHERE channelId = '${channelId}'`
    );

    if (!resp.changes) {
      return "Update Failed Cannot Find Channel";
    } else {
      return "Channel Updated Successfully";
    }
  }
}

export { DatabaseOperation };
