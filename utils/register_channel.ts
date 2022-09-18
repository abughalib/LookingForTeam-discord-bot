import { Message, PermissionFlagsBits } from "discord.js";

class RegisterChannel {
  isAdmin(message: Message) {
    return message.member?.permissions.has(PermissionFlagsBits.Administrator);
  }
}