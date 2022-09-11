import { Client, IntentsBitField } from "discord.js";
import { describe } from "mocha";
import { expect } from "chai";
import setCommands from "../handlers/commands";

let client = new Client({
  intents: [IntentsBitField.Flags.MessageContent],
});

describe("Command Create Test", () => {
  console.log(client.application);
});