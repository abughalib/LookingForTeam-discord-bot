import sqlite3 from "sqlite3";
import { open } from "sqlite";

enum ChannelType {
  PC,
  XBOX,
  PS,
  OTHER,
}

class DatabaseOperation {
  async getDatabase() {
    const db = await open({
      filename: "../database.db",
      driver: sqlite3.Database,
    });
    return db;
  }

  async getFromPlatformChannel(channelName: string, channelID: string) {
    const db = await this.getDatabase();

    const rows = await db.all(
      `SELECT id FROM ${channelName} WHERE channel_id='${channelID}'`
    );

    if (rows.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async setChannelPlatformType(channelType: ChannelType, channelID: string) {
    const db = await this.getDatabase();

    switch (channelType) {
      case ChannelType.PC:
        await db.run(`INSERT INTO PC_CHANNEL_IDs VALUES('${channelID}')`);
        break;
      case ChannelType.XBOX:
        await db.run(`INSERT INTO XBOX_CHANNEL_IDs VALUES('${channelID}')`);
        break;
      case ChannelType.PS:
        await db.run(`INSERT INTO PS_CHANNEL_IDs VALUES('${channelID}')`);
        break;
      default:
        break;
    }
  }

  async getChannelType(channelID: string): Promise<ChannelType> {
    let channelType: ChannelType = ChannelType.OTHER;

    if (await this.getFromPlatformChannel("PC_CHANNEL_IDs", channelID)) {
      return ChannelType.PC;
    }

    if (await this.getFromPlatformChannel("XBOX_CHANNEL_IDs", channelID)) {
      return ChannelType.XBOX;
    }

    if (await this.getFromPlatformChannel("PS_CHANNEL_IDs", channelID)) {
      return ChannelType.PS;
    }

    return channelType;
  }
}

export { DatabaseOperation, ChannelType };
