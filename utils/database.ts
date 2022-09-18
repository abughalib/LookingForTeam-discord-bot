import { Database } from "sqlite3";

enum ChannelType {
  PC,
  XBOX,
  PS,
  OTHER,
}

class DatabaseOperation {
  private database: Database = new Database(":memory:");

  constructor() {
    this.database = new Database("../database.db");
  }

  async getChannelType(channelID: string): Promise<ChannelType> {

    let channelType: ChannelType = ChannelType.OTHER;

    this.database.each(
      `SELECT id FROM PC_CHANNEL_IDs WHERE channel_id='${channelID}'`,
      (error, row) => {
        if (error) {
          console.error(`Dtabase Error: ${error}`);
        }
        console.log(`From PC: ${row.id}`);
        channelType = ChannelType.PC;
      }
    );

    this.database.each(
      `SELECT channel_id FROM XBOX_CHANNEL_IDs WHERE channel_id='${channelID}'`,
      (error, row) => {
        if (error) {
          console.error(`Dtabase Error: ${error}`);
        }
        channelType = ChannelType.XBOX;
        console.log(`From XBOX: ${row} Type: ${channelType}`);
      }
    );

    this.database.each(
      `SELECT channel_id FROM PS_CHANNEL_IDs WHERE channel_id='${channelID}'`,
      (error, row) => {
        if (error) {
          console.error(`Dtabase Error: ${error}`);
        }
        console.log(`From PS: ${row.id}`);
        channelType = ChannelType.PS;
      }
    );
    console.log(`Type: ${channelType}`);
    return channelType;
  }
}


let dbp: DatabaseOperation = new DatabaseOperation();

dbp.getChannelType('test_xbox').then((type)=> {
  console.log(type);
});