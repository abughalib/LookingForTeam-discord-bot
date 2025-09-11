import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
  RestOrArray,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import { randomUUID } from "crypto";
import {
  addColonizationData,
  countColonizationActiveProjects,
  getAllColonizationData,
  getColonizationDataByProjectName,
  getParticipantsByColonizationId,
  participateInColonizationData,
  removeColonizationDataByProjectName,
  updateColonizationData,
} from "../../../utils/database";
import { Position, SystemInfo } from "../../../utils/models";
import EDSM from "../../../utils/edsm";
import { ColonizationData } from "@prisma/client";
import CreateButtons from "../utils/createButtons";

export class Colonization {
  constructor(
    private interaction: CommandInteraction,
    private chatInputInteraction: ChatInputCommandInteraction,
    private dismissButton: CreateButtons = new CreateButtons(),
  ) {
    this.interaction = interaction;
    this.chatInputInteraction = interaction as ChatInputCommandInteraction;
  }

  async add() {
    const options = this.chatInputInteraction.options;

    const colonizationSystemName = options.getString(
      AppSettings.INTERACTION_COLONIZATION_SYSTEM_NAME_ID,
      true,
    );
    const rawProjectName =
      options.getString(
        AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
        true,
      ) ?? randomUUID().toLowerCase().slice(0, 8);

    // Replace spaces with underscores to avoid issues in button customIds and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();
    const architect =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_ARCHITECT_ID,
        false,
      ) as string) ?? (await this.getUserNickname());
    const notes =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_NOTES_ID,
        false,
      ) as string) ?? "";

    const timeLeft =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_TIMELEFT_ID,
        false,
      ) as string) ?? "0";
    const isPrimaryPort =
      (options.getBoolean(
        AppSettings.INTERACTION_COLONIZATION_IS_PRIMARY_PORT_ID,
        false,
      ) as boolean) ?? true;

    const progress =
      (options.getNumber(
        AppSettings.INTERACTION_COLONIZATION_PROGRESS_ID,
        false,
      ) as number) ?? 0;

    const starPortType = options.getString(
      AppSettings.INTERACTION_COLONIZATION_STARPORT_TYPE_ID,
      true,
    );

    const srv_survey_link =
      options.getString(
        AppSettings.INTERACTION_COLONIZATION_SRV_SURVEY_LINK_ID,
        false,
      ) ?? "";

    const systemInfo: SystemInfo | null = await EDSM.getSystemInfo(
      colonizationSystemName,
    );

    if (!systemInfo || !systemInfo.coords) {
      await this.interaction.reply({
        content: `Could not find system info for **${colonizationSystemName}**. Please check the system name and try again.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const nowTime = new Date();

    // Implementation for adding colonization
    await this.interaction.deferReply();

    console.log(systemInfo);

    try {
      const userNickname = await this.getUserNickname();
      const colonization_id = await addColonizationData({
        id: 0,
        projectName,
        systemName: systemInfo.name,
        architect,
        notes,
        timeLeft: this.parseTimeLeft(timeLeft),
        isPrimaryPort,
        progress,
        isCompleted: false,
        positionX: systemInfo.coords.x,
        positionY: systemInfo.coords.y,
        positionZ: systemInfo.coords.z,
        srv_survey_link,
        starPortType: starPortType,
        createdAt: nowTime,
        updatedAt: nowTime,
        addedBy: userNickname,
      });
      await participateInColonizationData(colonization_id, userNickname);
      await this.interaction.editReply({
        content: `Colonization project Name: **${projectName}** Added successfully.`,
      });
    } catch (error) {
      console.error("Error adding colonization data:", error);
      await this.interaction.followUp({
        content: `Failed to add colonization project: **${projectName}**`,
      });
    }
  }

  async remove() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true,
    ) as string;

    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const userNickname = await this.getUserNickname();

      // Check if the colonization project exists and get its data
      const colonizationData =
        await getColonizationDataByProjectName(projectName);

      if (!colonizationData) {
        await this.interaction.editReply({
          content: `No colonization project found with the name **${projectName}**.`,
        });
        return;
      }

      // Check if the user trying to remove is the one who added it
      if (colonizationData.addedBy !== userNickname) {
        await this.interaction.editReply({
          content: `You cannot remove this colonization project. Only **${colonizationData.addedBy}** (who created it) can remove it.`,
        });
        return;
      }

      await removeColonizationDataByProjectName(projectName);

      await this.interaction.editReply({
        content: `Colonization project Name: **${projectName}** has been removed.`,
      });
    } catch (error) {
      console.error("Error removing colonization data:", error);
      await this.interaction.followUp({
        content: `Failed to remove colonization project: **${projectName}**`,
      });
    }
  }

  async list() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      false,
    ) as string | null;

    // Replace spaces with underscores to match stored project name format (if provided) and ensure lowercase
    const projectName = rawProjectName
      ? rawProjectName.replace(/\s+/g, "_").toLowerCase()
      : null;

    const architectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_ARCHITECT_ID,
      false,
    ) as string | null;

    const referenceSystem = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_REFERENCE_SYSTEM_ID,
      false,
    ) as string | null;

    await this.interaction.deferReply();

    const dismissButton = this.dismissButton.createDismissButton();

    let position: Position | null = null;

    if (referenceSystem) {
      const systemInfo: SystemInfo | null =
        await EDSM.getSystemInfo(referenceSystem);

      if (systemInfo) {
        position = {
          x: systemInfo.coords.x,
          y: systemInfo.coords.y,
          z: systemInfo.coords.z,
        };
      }
    }

    const activeProjects = await getAllColonizationData(
      1,
      5,
      projectName || undefined,
      architectName || undefined,
      position || undefined,
    );

    if (activeProjects.length === 0) {
      await this.interaction.editReply({
        content: "No active colonization projects found.",
        components: [dismissButton],
      });
      return;
    }

    const participantNames = await Promise.all(
      activeProjects.map(async (project) => {
        const participantIds = await getParticipantsByColonizationId(
          project.id,
        );
        const participantNicknames =
          await this.getParticipantNicknames(participantIds);
        return {
          [project.id]: participantNicknames,
        };
      }),
    );

    const totalProjects = await countColonizationActiveProjects();

    const embed = new EmbedBuilder()
      .setTitle("Active Colonization Projects")
      .setColor(0x00ff00)
      .setTimestamp();

    activeProjects.forEach((project) => {
      const timeLeftFormatted = this.formatTimeFromSeconds(
        project.timeLeft || Infinity,
      );

      // Find participants for this project
      const projectParticipants =
        participantNames.find((p) => p[project.id])?.[project.id] || [];
      const participantsText =
        projectParticipants.length > 0
          ? `\nParticipants: ${projectParticipants.join(", ")}`
          : "";

      // Calculate distance if reference system is provided
      let distanceText = "";
      if (
        position &&
        project.positionX !== null &&
        project.positionY !== null &&
        project.positionZ !== null
      ) {
        const distance = this.calculateDistance(position, {
          x: project.positionX,
          y: project.positionY,
          z: project.positionZ,
        });
        distanceText = `\nDistance: ${distance.toFixed(2)} Ly`;
      } else if (position) {
        distanceText = `\nDistance: ∞ Ly (coordinates unavailable)`;
      }

      embed.addFields({
        name: `Project Name: ${project.projectName}\nSystem Name: ${project.systemName}`,
        value: `Architect: ${project.architect}\nProgress: ${
          project.progress
        }%\nPrimary Port: ${
          project.isPrimaryPort ? "Yes" : "No"
        }\nStarport Type: ${
          project.starPortType
        }\nTime Left: ${timeLeftFormatted}${distanceText}${participantsText}\n${
          project.srv_survey_link
            ? `[SRV Survey Link](${project.srv_survey_link})\n`
            : ""
        }${project.notes ? `\nNotes: ${project.notes}` : ""}`,
      });
    });

    // Add Next Button
    const nextButton = new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_NEXT_COLONIZATION_LIST_ID)
      .setLabel(AppSettings.BUTTON_NEXT_COLONIZATION_LIST_LABEL)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(nextButton);
    // Add button to select project 1 to length of activeProjects
    for (let i = 0; i < activeProjects.length; i++) {
      const project = activeProjects[i];
      const projectButton = new ButtonBuilder()
        .setCustomId(`colonization_list_select_${project.projectName}`)
        .setLabel(`${i + 1}`)
        .setStyle(ButtonStyle.Secondary);
      row.addComponents(projectButton);
    }

    row.addComponents(dismissButton.components[0]);

    embed.setFooter({
      text: `Page 1 of ${Math.ceil(totalProjects / 5)}`,
    });

    await this.interaction.editReply({ embeds: [embed], components: [row] });
  }

  async progress() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true,
    ) as string;

    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    await this.interaction.deferReply();

    const dismissButton = this.dismissButton.createDismissButton();

    const colonizationData: ColonizationData | null =
      await getColonizationDataByProjectName(projectName);

    if (!colonizationData) {
      await this.interaction.editReply({
        content: `No colonization project found with the name **${projectName}**.`,
        components: [dismissButton],
      });
      return;
    }

    const timeLeftFormatted = this.formatTimeFromSeconds(
      colonizationData.timeLeft || Infinity,
    );

    const participantIds = await getParticipantsByColonizationId(
      colonizationData.id,
    );
    const participantNames = await this.getParticipantNicknames(participantIds);

    const embed = new EmbedBuilder()
      .setTitle(`Colonization Project: ${colonizationData.projectName}`)
      .setColor(0x00ff00)
      .addFields(
        {
          name: "System Name",
          value: colonizationData.systemName,
          inline: true,
        },
        { name: "Architect", value: colonizationData.architect, inline: true },
        {
          name: "Progress",
          value: `${colonizationData.progress}%`,
          inline: true,
        },
        {
          name: "Primary Port",
          value: colonizationData.isPrimaryPort ? "Yes" : "No",
          inline: true,
        },
        {
          name: "Starport Type",
          value: colonizationData.starPortType,
          inline: true,
        },
        { name: "Time Left", value: timeLeftFormatted, inline: true },
        { name: "Added By", value: colonizationData.addedBy, inline: true },
        { name: "Notes", value: colonizationData.notes || "N/A" },
        {
          name: "Participants",
          value:
            participantNames.length > 0 ? participantNames.join(", ") : "None",
        },
      )
      .setAuthor({ name: "Added By: " + colonizationData.addedBy })
      .setFooter({ text: `Created At: ${colonizationData.createdAt}` })
      .setURL(colonizationData.srv_survey_link)
      .setTimestamp();

    await this.interaction.editReply({
      embeds: [embed],
      components: [dismissButton],
    });
  }

  async participate() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true,
    ) as string;

    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    const dismissButton = this.dismissButton.createDismissButton();

    await this.interaction.deferReply();

    const colonizationData: ColonizationData | null =
      await getColonizationDataByProjectName(projectName);

    if (!colonizationData) {
      await this.interaction.editReply({
        content: `No colonization project found with the name **${projectName}**.`,
        components: [dismissButton],
      });
      return;
    }

    try {
      const userNickname = await this.getUserNickname();

      // Check if user is already participating
      const participants = await getParticipantsByColonizationId(
        colonizationData.id,
      );
      if (participants.includes(userNickname)) {
        await this.interaction.editReply({
          content: `You already joined the colonization project **${projectName}**.`,
          components: [dismissButton],
        });
        return;
      }

      await participateInColonizationData(colonizationData.id, userNickname);
      await this.interaction.editReply({
        content: `You have successfully joined the colonization project **${projectName}**.`,
        components: [dismissButton],
      });
    } catch (error) {
      console.error("Error participating in colonization project:", error);
      await this.interaction.editReply({
        content: `Failed to join the colonization project: **${projectName}**`,
        components: [dismissButton],
      });
    }
  }

  async help() {
    const embed = new EmbedBuilder()
      .setTitle("Colonization Command Help")
      .setColor(0x00ff00)
      .setDescription(
        "Manage and track colonization projects with the following commands:",
      )
      .addFields(
        {
          name: "/colonization add",
          value:
            "Add a new colonization project. Required fields: system name, project name, starport type. Optional fields: architect, notes, time left, is primary port, progress, SRV survey link.",
        },
        {
          name: "/colonization remove",
          value:
            "Remove an existing colonization project by specifying the project name.",
        },
        {
          name: "/colonization list",
          value:
            "List all active colonization projects. Optional filters: project name, architect name, reference system for distance sorting.",
        },
        {
          name: "/colonization progress",
          value:
            "View detailed information about a specific colonization project by providing the project name.",
        },
        {
          name: "/colonization participate",
          value:
            "Join a colonization project as a participant by specifying the project name.",
        },
        {
          name: "/colonization update-progress",
          value:
            "Update the progress of an existing colonization project. Required fields: project name, progress percentage.",
        },
        {
          name: "/colonization help",
          value: "Display this help message.",
        },
      )
      .setTimestamp();

    await this.interaction.reply({ embeds: [embed], ephemeral: true });
  }

  async updateProgress() {
    const options = this.chatInputInteraction.options;
    const rawProjectName = options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true,
    ) as string;
    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();
    const progress = options.getNumber(
      AppSettings.INTERACTION_COLONIZATION_PROGRESS_ID,
      true,
    ) as number;

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const colonizationData: ColonizationData | null =
      await getColonizationDataByProjectName(projectName);

    if (!colonizationData) {
      await this.interaction.editReply({
        content: `No colonization project found with the name **${projectName}**.`,
      });
      return;
    }

    try {
      const userNickname = await this.getUserNickname();

      // Check if user is a participant in this project or the creator
      const participantIds = await getParticipantsByColonizationId(
        colonizationData.id,
      );
      const participantNicknames =
        await this.getParticipantNicknames(participantIds);

      const isParticipant = participantNicknames.includes(userNickname);
      const isCreator = colonizationData.addedBy === userNickname;

      if (!isParticipant && !isCreator) {
        await this.interaction.editReply({
          content: `You cannot update progress for this project. Only participants or the project creator can update progress.\nProject Creator: ${colonizationData.addedBy}\nCurrent participants: ${participantNicknames.join(", ") || "None"}`,
        });
        return;
      }
      // Update the progress and updatedAt fields
      colonizationData.progress = progress;
      colonizationData.updatedAt = new Date();

      // If progress is 100%, mark as completed
      if (progress >= 100) {
        colonizationData.isCompleted = true;
        colonizationData.timeLeft = Infinity; // Set timeLeft to Infinity if completed
      }

      // Save the updated data back to the database
      await updateColonizationData(colonizationData.id, {
        progress: colonizationData.progress,
        isCompleted: colonizationData.isCompleted,
        timeLeft: colonizationData.timeLeft,
        updatedAt: colonizationData.updatedAt,
      });
      await this.interaction.editReply({
        content: `Colonization project **${projectName}** progress updated to ${progress}%.`,
      });
    } catch (error) {
      console.error("Error updating colonization progress:", error);
      await this.interaction.editReply({
        content: `Failed to update progress for colonization project: **${projectName}**`,
      });
    }
  }

  parseTimeLeft(timeLeft: string): number {
    // Remove all spaces from the input string
    const cleanTimeLeft = timeLeft.replace(/\s/g, "");

    // Updated pattern to include weeks (w), days (d), hours (h), and minutes (m)
    const timePattern = /(\d+)([wdhm])/g;
    let totalSeconds = 0;
    let match;

    while ((match = timePattern.exec(cleanTimeLeft)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "w": // weeks
          totalSeconds += value * 7 * 24 * 60 * 60;
          break;
        case "d": // days
          totalSeconds += value * 24 * 60 * 60;
          break;
        case "h": // hours
          totalSeconds += value * 60 * 60;
          break;
        case "m": // minutes
          totalSeconds += value * 60;
          break;
      }
    }

    return totalSeconds;
  }

  formatTimeFromSeconds(totalSeconds: number): string {
    if (totalSeconds === 0) return "0m";

    const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
    const days = Math.floor(
      (totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60),
    );
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    const parts: string[] = [];

    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  }

  getFields(
    options: string[],
    values: (string | number | boolean)[],
    inline: boolean = false,
  ): RestOrArray<APIEmbedField> {
    const fields: RestOrArray<APIEmbedField> = Array.from(
      Array(Math.max(options.length, values.length)),
      (_, i): APIEmbedField => {
        return { name: options[i], value: `${values[i]}`, inline: inline };
      },
    );

    return fields;
  }

  colonizationFieldEmbedMessage(
    title: string,
    options: string[],
    values: (string | number | boolean)[],
    inline: boolean = false,
  ): EmbedBuilder {
    // Creating the embeded message
    const embeded_message = new EmbedBuilder()
      .setTitle(title)
      .addFields(...this.getFields(options, values, inline))
      .setTimestamp(Date.now());

    return embeded_message;
  }

  /**
   * Calculate Euclidean distance between two 3D points in light years
   * @param pos1 First position (reference system)
   * @param pos2 Second position (target system)
   * @returns Distance in light years
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get the user's nickname or username if nickname is not available
   * @param userId User ID to fetch nickname for
   * @returns User's server nickname or username
   */
  private async getUserNickname(userId?: string): Promise<string> {
    try {
      const targetUserId = userId || this.interaction.user.id;
      const userInteracted =
        await this.interaction.guild?.members.fetch(targetUserId);
      return userInteracted?.nickname || this.interaction.user.username;
    } catch (error) {
      console.error("Error fetching user nickname:", error);
      return this.interaction.user.username;
    }
  }

  /**
   * Convert participant IDs to nicknames
   * @param participantIds Array of participant user IDs
   * @returns Array of participant nicknames
   */
  private async getParticipantNicknames(
    participantIds: string[],
  ): Promise<string[]> {
    const nicknames: string[] = [];
    for (const participantId of participantIds) {
      try {
        const userMember =
          await this.interaction.guild?.members.fetch(participantId);
        const nickname =
          userMember?.nickname || userMember?.user.username || participantId;
        nicknames.push(nickname);
      } catch (error) {
        console.error(
          `Error fetching nickname for user ${participantId}:`,
          error,
        );
        nicknames.push(participantId); // Fallback to user ID
      }
    }
    return nicknames;
  }
}
