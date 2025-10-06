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
  removeParticipantFromProject,
  updateColonizationData,
} from "../../../utils/database";
import { Position, SystemInfo } from "../../../utils/models";
import EDSM from "../../../utils/edsm";
import { ColonizationData } from "@prisma/client";
import CreateButtons from "../utils/createButtons";
import { RavenColonial } from "../../../utils/ravenColonial";
import { RavenColonialProgress } from "../../../utils/ravenTypes";

export class Colonization {
  constructor(
    private interaction: CommandInteraction,
    private chatInputInteraction: ChatInputCommandInteraction,
    private dismissButton: CreateButtons = new CreateButtons()
  ) {
    this.interaction = interaction;
    this.chatInputInteraction = interaction as ChatInputCommandInteraction;
  }

  async add() {
    const options = this.chatInputInteraction.options;

    const colonizationSystemName = options.getString(
      AppSettings.INTERACTION_COLONIZATION_SYSTEM_NAME_ID,
      true
    );
    const dismissButton = this.dismissButton.createDismissButton(
      AppSettings.BUTTON_DISMISS_ID,
      AppSettings.BUTTON_DISMISS_LABEL
    );
    const rawProjectName =
      options.getString(
        AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
        true
      ) ?? randomUUID().toLowerCase().slice(0, 8);

    // Replace spaces with underscores to avoid issues in button customIds and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();
    const architect =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_ARCHITECT_ID,
        false
      ) as string) ?? (await this.getUserNickname());
    const notes =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_NOTES_ID,
        false
      ) as string) ?? "";

    let timeLeft =
      (options.getString(
        AppSettings.INTERACTION_COLONIZATION_TIMELEFT_ID,
        false
      ) as string) ?? "4w";
    const isPrimaryPort =
      (options.getBoolean(
        AppSettings.INTERACTION_COLONIZATION_IS_PRIMARY_PORT_ID,
        false
      ) as boolean) ?? true;

    const progress =
      (options.getNumber(
        AppSettings.INTERACTION_COLONIZATION_PROGRESS_ID,
        false
      ) as number) ?? 0;

    const starPortType = options.getString(
      AppSettings.INTERACTION_COLONIZATION_STARPORT_TYPE_ID,
      true
    );

    const systemInfo: SystemInfo | null = await EDSM.getSystemInfo(
      colonizationSystemName
    );

    if (!systemInfo || !systemInfo.coords) {
      await this.interaction.reply({
        content: `Could not find system info for **${colonizationSystemName}**. Please check the system name and try again.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const srv_survey_link =
      options.getString(
        AppSettings.INTERACTION_COLONIZATION_SRV_SURVEY_LINK_ID,
        false
      ) ??
      AppSettings.REVENCOLONIAL_DEFAULT_URL +
        encodeURIComponent(colonizationSystemName!);

    const nowTime = new Date();

    // Implementation for adding colonization
    await this.interaction.deferReply();

    try {
      // Check if a project with the same name already exists
      const existingProject = await getColonizationDataByProjectName(
        projectName
      );
      if (existingProject) {
        await this.interaction.editReply({
          content: `A colonization project with the name **${projectName}** already exists. Please choose a different project name.`,
          components: [dismissButton],
        });
        return;
      }

      const userNickname = await this.getUserNickname();
      const userId = this.interaction.user.id;

      // Create the colonization project and get the ID
      const colonization_id = await addColonizationData({
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

      // Automatically add the creator as a participant
      await participateInColonizationData(colonization_id, userId);

      const timeLeftFormatted = this.formatTimeFromSeconds(
        this.parseTimeLeft(timeLeft)
      );

      const embed = new EmbedBuilder()
        .setTitle("Added Colonization")
        .setColor(0x00ff00)
        .setTimestamp();

      embed.addFields({
        name: `Project Name: ${projectName}\nSystem Name: ${systemInfo.name}`,
        value: `Architect: ${architect}\nProgress: ${progress}%\nPrimary Port: ${
          isPrimaryPort ? "Yes" : "No"
        }\nStarport Type: ${starPortType}\nTime Left: ${timeLeftFormatted}\n${
          srv_survey_link ? `[Link](${srv_survey_link})\n` : ""
        }${notes ? `\nNotes: ${notes}` : ""}`,
      });

      await this.interaction.editReply({
        embeds: [embed],
        components: [dismissButton],
      });
    } catch (error) {
      console.error("Error adding colonization data:", error);
      await this.interaction.followUp({
        content: `Failed to add colonization project: **${projectName}**.`,
        components: [dismissButton],
      });
    }
  }

  async remove() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true
    ) as string;

    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const userNickname = await this.getUserNickname();

      // Check if the colonization project exists and get its data
      const colonizationData = await getColonizationDataByProjectName(
        projectName
      );

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
      false
    ) as string | null;

    // Replace spaces with underscores to match stored project name format (if provided) and ensure lowercase
    const projectName = rawProjectName
      ? rawProjectName.replace(/\s+/g, "_").toLowerCase()
      : null;

    const architectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_ARCHITECT_ID,
      false
    ) as string | null;

    const isPrimaryPort = this.chatInputInteraction.options.getBoolean(
      AppSettings.INTERACTION_COLONIZATION_IS_PRIMARY_PORT_ID,
      false
    ) as boolean | null;

    const starPortType = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_STARPORT_TYPE_ID,
      false
    ) as string | null;

    const referenceSystem = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_REFERENCE_SYSTEM_ID,
      false
    ) as string | null;

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const dismissButton = this.dismissButton.createDismissButton();

    let position: Position | null = null;

    if (referenceSystem) {
      const systemInfo: SystemInfo | null = await EDSM.getSystemInfo(
        referenceSystem
      );

      if (systemInfo && systemInfo.coords) {
        position = {
          x: systemInfo.coords.x,
          y: systemInfo.coords.y,
          z: systemInfo.coords.z,
        };
      } else {
        await this.interaction.editReply({
          content: `Could not find system info for reference system **${referenceSystem}**. Distance calculations will be skipped.`,
          components: [dismissButton],
        });
      }
    }

    const activeProjects = await getAllColonizationData(
      1,
      5,
      projectName || undefined,
      architectName || undefined,
      position || undefined,
      isPrimaryPort ?? undefined,
      starPortType || undefined
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
          project.id
        );
        const participantNicknames = await this.getParticipantNicknames(
          participantIds
        );
        return {
          [project.id]: participantNicknames,
        };
      })
    );

    const totalProjects = await countColonizationActiveProjects();

    const embed = new EmbedBuilder()
      .setTitle("Active Colonization Projects")
      .setColor(0x00ff00)
      .setTimestamp();

    const projectFields = await Promise.all(
      activeProjects.map(async (project, index) => {
        // Update the colonization Project progress
        const updatedData = await this.updateProgressFromRavenColonial(
          project.srv_survey_link,
          project.id
        );

        // Wait for the cache operation to complete before calculating progress
        let updatedProgress: string | null = null;
        if (updatedData) {
          updatedProgress = (
            ((updatedData.maxNeed - updatedData.sumNeed) /
              updatedData.maxNeed) *
            100
          ).toFixed(2);
        }

        const timeLeftFormatted = this.formatTimeFromSeconds(
          project.timeLeft || Infinity
        );

        // Find participants for this project
        const projectParticipants =
          participantNames.find((p) => p[project.id])?.[project.id] || [];
        const participantsText =
          projectParticipants.length > 0
            ? `\nParticipants:\n${projectParticipants.join("\n")}`
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

        return {
          name: `**${index + 1}.** Project Name: ${
            project.projectName
          }\nSystem Name: ${project.systemName}`,
          value: `Architect: ${project.architect}\nProgress: ${
            updatedProgress ?? project.progress
          }%\nPrimary Port: ${
            project.isPrimaryPort ? "Yes" : "No"
          }\nStarport Type: ${
            project.starPortType
          }\nTime Left: ${timeLeftFormatted}${distanceText}${participantsText}\n${
            project.srv_survey_link
              ? `[Link](${project.srv_survey_link})\n`
              : ""
          }${project.notes ? `\nNotes: ${project.notes}` : ""}`,
        };
      })
    );

    embed.addFields(...projectFields);

    if (referenceSystem) {
      embed.setDescription(`Reference System: **${referenceSystem}**`);
    }

    // Create button components with proper row distribution
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    // First row: Next button and project selection buttons (max 4 project buttons to stay under 5 total)
    const firstRow = new ActionRowBuilder<ButtonBuilder>();

    const currentPage = 1;
    const totalPages = Math.ceil(totalProjects / 5);

    // Only show next button if there are more pages
    if (currentPage < totalPages) {
      const nextButton = new ButtonBuilder()
        .setCustomId(
          `${AppSettings.BUTTON_NEXT_COLONIZATION_LIST_ID}_${
            currentPage + 1
          }_${JSON.stringify({ projectName, architectName, referenceSystem })}`
        )
        .setLabel(AppSettings.BUTTON_NEXT_COLONIZATION_LIST_LABEL)
        .setStyle(ButtonStyle.Primary);
      firstRow.addComponents(nextButton);
    }

    // Add up to remaining slots for project selection buttons (account for next button)
    const maxProjectButtonsInFirstRow = Math.min(
      5 - firstRow.components.length,
      activeProjects.length
    );
    for (let i = 0; i < maxProjectButtonsInFirstRow; i++) {
      const project = activeProjects[i];
      const projectButton = new ButtonBuilder()
        .setCustomId(`colonization_list_select_${project.projectName}`)
        .setLabel(`${i + 1}`)
        .setStyle(ButtonStyle.Secondary);
      firstRow.addComponents(projectButton);
    }
    components.push(firstRow);

    // Second row: Remaining project buttons (if any) and dismiss button
    if (
      activeProjects.length > maxProjectButtonsInFirstRow ||
      dismissButton.components[0]
    ) {
      const secondRow = new ActionRowBuilder<ButtonBuilder>();

      // Add remaining project buttons
      for (
        let i = maxProjectButtonsInFirstRow;
        i < activeProjects.length;
        i++
      ) {
        const project = activeProjects[i];
        const projectButton = new ButtonBuilder()
          .setCustomId(`colonization_list_select_${project.projectName}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Secondary);
        secondRow.addComponents(projectButton);
      }

      // Add dismiss button
      secondRow.addComponents(dismissButton.components[0]);
      components.push(secondRow);
    }

    embed.setFooter({
      text: `Page 1 of ${Math.ceil(totalProjects / 5)}`,
    });

    await this.interaction.editReply({ embeds: [embed], components });
  }

  async progress() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true
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
      colonizationData.timeLeft || Infinity
    );

    const participantIds = await getParticipantsByColonizationId(
      colonizationData.id
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
        }
      )
      .setAuthor({ name: "Added By: " + colonizationData.addedBy })
      .setFooter({ text: `Created At: ${colonizationData.createdAt}` })
      .setTimestamp();

    if (colonizationData.srv_survey_link) {
      embed.setURL(colonizationData.srv_survey_link);
    }

    await this.interaction.editReply({
      embeds: [embed],
      components: [dismissButton],
    });
  }

  async participate() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true
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
      const userId = this.interaction.user.id; // Use Discord user ID instead of nickname

      // Check if user is already participating (check both ID and nickname for legacy data)
      const participants = await getParticipantsByColonizationId(
        colonizationData.id
      );
      if (
        participants.includes(userId) ||
        participants.includes(userNickname)
      ) {
        await this.interaction.editReply({
          content: `You already joined the colonization project **${projectName}**.`,
          components: [dismissButton],
        });
        return;
      }

      await participateInColonizationData(colonizationData.id, userId);
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

  async leave() {
    const rawProjectName = this.chatInputInteraction.options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true
    ) as string;

    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    const dismissButton = this.dismissButton.createDismissButton();

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

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
      const userId = this.interaction.user.id; // Use Discord user ID instead of nickname

      // Check if user is participating (check both ID and nickname for legacy data)
      const participants = await getParticipantsByColonizationId(
        colonizationData.id
      );
      if (
        !participants.includes(userId) &&
        !participants.includes(userNickname)
      ) {
        await this.interaction.editReply({
          content: `You are not participating in the colonization project **${projectName}**.`,
          components: [dismissButton],
        });
        return;
      }

      await removeParticipantFromProject(colonizationData.id, userId);
      await this.interaction.editReply({
        content: `You have successfully left the colonization project **${projectName}**.`,
        components: [dismissButton],
      });
    } catch (error) {
      console.error("Error leaving colonization project:", error);
      await this.interaction.editReply({
        content: `Failed to leave the colonization project: **${projectName}**`,
        components: [dismissButton],
      });
    }
  }

  async help() {
    // Create main help embed
    const mainEmbed = new EmbedBuilder()
      .setTitle("🚀 System Colonization Tracking")
      .setColor(0x00ff00)
      .setDescription(
        "This comprehensive guide will help you track and manage Elite Dangerous colonization projects.\n\n" +
          "🔹 **Distance calculation** when reference system provided\n" +
          "🔹 **Authorization system** - only participants/creators can update progress\n" +
          "🔹 **Interactive buttons** for easy navigation"
      );

    // Commands overview embed
    const commandsEmbed = new EmbedBuilder()
      .setTitle("📋 Available Commands")
      .setColor(0x0099ff)
      .addFields(
        {
          name: "🆕 `/colonization_add`",
          value:
            "**Create a new colonization project**\n" +
            "• **Required:** `system_name`, `project_name`, `starport_type`\n" +
            "• **Optional:** `architect`, `notes`, `time_left`, `is_primary_port`, `progress`, `srv_survey_link`\n" +
            '• **Example:** `/colonization add system_name:"Colonia" project_name:"My Station" starport_type:"Coriolis"`',
        },
        {
          name: "📋 `/colonization_list`",
          value:
            "**List all active projects with smart sorting**\n" +
            "• **Optional filters:** `project_name`, `architect_name`, `reference_system`, `is_primary_port`, `starport_type`\n" +
            "• **Smart sorting priority:** 1) Distance (if reference system), 2) Time left, 3) Primary ports, 4) Progress\n" +
            "• **Interactive:** Use numbered buttons to select projects\n" +
            '• **Example:** `/colonization list reference_system:"Sol" is_primary_port:true`',
        },
        {
          name: "👥 `/colonization_participate`",
          value:
            "**Join an existing colonization project**\n" +
            "• **Required:** `project_name`\n" +
            "• **Note:** You'll be automatically added as a participant\n" +
            '• **Example:** `/colonization participate project_name:"my_station"`',
        },
        {
          name: "🚪 `/colonization_leave`",
          value:
            "**Leave an existing colonization project**\n" +
            "• **Required:** `project_name`\n" +
            "• **Note:** You can only leave projects you're participating in\n" +
            '• **Example:** `/colonization_leave project_name:"my_station"`',
        }
      );

    // More commands embed
    const moreCommandsEmbed = new EmbedBuilder()
      .setTitle("🔧 Management Commands")
      .setColor(0xff9900)
      .addFields(
        {
          name: "📊 `/colonization_progress`",
          value:
            "**View detailed information about a project**\n" +
            "• **Required:** `project_name`\n" +
            "• **Shows:** All project details, participants, coordinates, survey links\n" +
            '• **Example:** `/colonization_progress project_name:"my_station"`',
        },
        {
          name: "📈 `/colonization_update_progress`",
          value:
            "**Update project completion percentage**\n" +
            "• **Required:** `project_name`, `progress` (0-100)\n" +
            "• **Authorization:** Only participants or project creator can update\n" +
            "• **Auto-complete:** Project marked complete at 100%\n" +
            '• **Example:** `/colonization_update_progress project_name:"my_station" progress:75`',
        },
        {
          name: "🗑️ `/colonization_remove`",
          value:
            "**Delete a colonization project**\n" +
            "• **Required:** `project_name`\n" +
            "• **Authorization:** Only the project creator can remove projects\n" +
            "• **Warning:** This action cannot be undone!\n" +
            '• **Example:** `/colonization_remove project_name:"my_station"`',
        }
      );

    // Tips and examples embed
    const tipsEmbed = new EmbedBuilder()
      .setTitle("💡 Tips & Examples")
      .setColor(0x9900ff)
      .addFields(
        {
          name: "⏰ Time Format Examples",
          value:
            "Use combinations of weeks (w), days (d), hours (h), minutes (m):\n" +
            "• `1w 3d 2h 30m` = 1 week, 3 days, 2 hours, 30 minutes\n" +
            "• `5d` = 5 days\n" +
            "• `2h 15m` = 2 hours, 15 minutes\n" +
            "• `0` = No time limit",
        },
        {
          name: "🌟 Best Practices",
          value:
            "• **Project names:** Use underscores instead of spaces (auto-converted)\n" +
            "• **System names:** Use exact names from EDSM database\n" +
            "• **Architect field:** Defaults to your Discord nickname if not specified\n" +
            "• **Reference system:** Use your current location for distance sorting\n" +
            "• **SRV surveys:** Include survey links to help other players",
        },
        {
          name: "🔒 Authorization System",
          value:
            "• **Project creators** can remove their own projects\n" +
            "• **Participants + creators** can update project progress\n" +
            "• **Anyone** can view project details and join projects\n" +
            "• **Discord nicknames** are used for all user identification",
        },
        {
          name: "📊 Smart Sorting Algorithm",
          value:
            "**Priority order for listing projects:**\n" +
            "1. **Distance** - Closer systems first (when reference system provided)\n" +
            "2. **Time Left** - Less time remaining first (dynamic calculation)\n" +
            "3. **Primary Ports** - Primary starports listed before secondary\n" +
            "4. **Progress** - Less completed projects first (more work needed)",
        },
        {
          name: "⏰ Dynamic Time Tracking",
          value:
            "**Time left is calculated in real-time:**\n" +
            "• **Remaining time** = Original duration - Time elapsed since creation\n" +
            "• **'No deadline'** = Projects with unlimited time\n" +
            "• **'EXPIRED'** = Projects past their deadline (shown in direct queries only)\n" +
            "• **List filtering** = Only active (non-expired) projects shown in lists",
        }
      );

    // Starport types embed
    const starportEmbed = new EmbedBuilder()
      .setTitle("🏗️ Starport Types")
      .setColor(0x00ff99)
      .addFields({
        name: "Available Starport Types",
        value:
          "• **Coriolis** - Standard rotating station\n" +
          "• **Ocellus** - Spherical station\n" +
          "• **Orbis** - Hexagonal station\n" +
          "• **Outpost** - Small landing pad station\n" +
          "• **Planetary Outpost (L)** - Large Surface-based port\n" +
          "• **Planetary Outpost (M)** - Medium mobile station\n" +
          "• **Asteroid Base** - Hollowed asteroid\n" +
          "• **Installation** - Installation structure\n\n" +
          "• Add Rest of the detail in `notes` field when adding a project.",
      });

    await this.interaction.reply({
      embeds: [
        mainEmbed,
        commandsEmbed,
        moreCommandsEmbed,
        tipsEmbed,
        starportEmbed,
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  async update() {
    const options = this.chatInputInteraction.options;
    const rawProjectName = options.getString(
      AppSettings.INTERACTION_COLONIZATION_PROJECT_NAME_ID,
      true
    ) as string;
    // Replace spaces with underscores to match stored project name format and ensure lowercase
    const projectName = rawProjectName.replace(/\s+/g, "_").toLowerCase();

    const dismissButton = this.dismissButton.createDismissButton();

    await this.interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

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
      const userId = this.interaction.user.id; // Use Discord user ID for participant check

      // Check if user is a participant in this project or the creator
      const participantIds = await getParticipantsByColonizationId(
        colonizationData.id
      );
      const participantNicknames = await this.getParticipantNicknames(
        participantIds
      );

      // Check both user ID (new format) and nickname (legacy format) for participation
      const isParticipant =
        participantIds.includes(userId) ||
        participantIds.includes(userNickname);
      const isCreator = colonizationData.addedBy === userNickname;

      if (!isParticipant && !isCreator) {
        await this.interaction.editReply({
          content: `You cannot update this project. Only participants or the project creator can update it.\nProject Creator: ${
            colonizationData.addedBy
          }\nCurrent participants: ${
            participantNicknames.join("\n") || "None"
          }`,
          components: [dismissButton],
        });
        return;
      }

      // Collect optional updates
      const updates: Partial<ColonizationData> = {
        updatedAt: new Date(),
      };

      const updatedFields: string[] = [];

      // Handle system name update (requires validation)
      const newSystemName = options.getString(
        AppSettings.INTERACTION_COLONIZATION_SYSTEM_NAME_ID,
        false
      );
      if (newSystemName && newSystemName.trim() !== "") {
        const systemInfo: SystemInfo | null = await EDSM.getSystemInfo(
          newSystemName.trim()
        );

        if (!systemInfo || !systemInfo.coords) {
          await this.interaction.editReply({
            content: `Could not find system info for **${newSystemName}**. Please check the system name and try again.`,
            components: [dismissButton],
          });
          return;
        }

        updates.systemName = systemInfo.name;
        updates.positionX = systemInfo.coords.x;
        updates.positionY = systemInfo.coords.y;
        updates.positionZ = systemInfo.coords.z;
        updatedFields.push(`System: ${systemInfo.name}`);
      }

      // Handle starport type update
      const newStarPortType = options.getString(
        AppSettings.INTERACTION_COLONIZATION_STARPORT_TYPE_ID,
        false
      );
      if (newStarPortType && newStarPortType.trim() !== "") {
        updates.starPortType = newStarPortType;
        updatedFields.push(`Starport Type: ${newStarPortType}`);
      }

      // Handle Link update
      const newSrvSurveyLink = options.getString(
        AppSettings.INTERACTION_COLONIZATION_SRV_SURVEY_LINK_ID,
        false
      );
      if (newSrvSurveyLink !== null && newSrvSurveyLink.trim() !== "") {
        updates.srv_survey_link = newSrvSurveyLink.trim();
        updatedFields.push(`Link: ${newSrvSurveyLink.trim()}`);
      }

      // Handle time left update
      const newTimeLeft = options.getString(
        AppSettings.INTERACTION_COLONIZATION_TIMELEFT_ID,
        false
      );
      if (newTimeLeft && newTimeLeft.trim() !== "") {
        const parsedTimeLeft = this.parseTimeLeft(newTimeLeft.trim());
        updates.timeLeft = parsedTimeLeft;
        const timeLeftFormatted = this.formatTimeFromSeconds(parsedTimeLeft);
        updatedFields.push(`Time Left: ${timeLeftFormatted}`);
      }

      // Handle architect update
      const newArchitect = options.getString(
        AppSettings.INTERACTION_COLONIZATION_ARCHITECT_ID,
        false
      );
      if (newArchitect && newArchitect.trim() !== "") {
        updates.architect = newArchitect.trim();
        updatedFields.push(`Architect: ${newArchitect.trim()}`);
      }

      // Handle primary port update
      const newIsPrimaryPort = options.getBoolean(
        AppSettings.INTERACTION_COLONIZATION_IS_PRIMARY_PORT_ID,
        false
      );
      if (newIsPrimaryPort !== null) {
        updates.isPrimaryPort = newIsPrimaryPort;
        updatedFields.push(`Primary Port: ${newIsPrimaryPort ? "Yes" : "No"}`);
      }

      // Handle progress update
      const newProgress = options.getNumber(
        AppSettings.INTERACTION_COLONIZATION_PROGRESS_ID,
        false
      );
      if (newProgress !== null) {
        updates.progress = newProgress;
        updatedFields.push(`Progress: ${newProgress}%`);

        // If progress is 100%, mark as completed
        if (newProgress >= 100) {
          updates.isCompleted = true;
          updates.timeLeft = 0; // Set timeLeft to 0 (infinite) if completed
          updatedFields.push("Status: Completed");
        }
      }

      // Handle notes update
      const newNotes = options.getString(
        AppSettings.INTERACTION_COLONIZATION_NOTES_ID,
        false
      );
      if (newNotes !== null) {
        updates.notes = newNotes.trim() || null;
        updatedFields.push(`Notes: ${newNotes.trim() || "Removed"}`);
      }

      // Check if any updates were provided
      if (updatedFields.length === 0) {
        await this.interaction.editReply({
          content: `No valid updates provided for colonization project **${projectName}**. Please specify at least one field to update.`,
          components: [dismissButton],
        });
        return;
      }

      // Save the updated data back to the database
      await updateColonizationData(colonizationData.id, updates);

      const embed = new EmbedBuilder()
        .setTitle(`Updated Colonization Project: ${projectName}`)
        .setColor(0x00ff00)
        .setDescription(
          `Successfully updated the following fields:\n\n${updatedFields.join(
            "\n"
          )}`
        )
        .setTimestamp();

      await this.interaction.editReply({
        embeds: [embed],
        components: [dismissButton],
      });
    } catch (error) {
      console.error("Error updating colonization project:", error);
      await this.interaction.editReply({
        content: `Failed to update colonization project: **${projectName}**`,
        components: [dismissButton],
      });
    }
  }

  async updateProgressFromRavenColonial(
    url: string,
    colonizationId: number
  ): Promise<RavenColonialProgress | null> {
    // Build URL: https://ravencolonial.com/#build=220b4ba8-ad69-427e-99b8-39da23d270c3
    // System URL: https://ravencolonial.com/#sys=Parrot's%20Head%20Sector%20EL-Y%20d83

    if (AppSettings.RAVEN_COLONIZATION_URL_REGEX.test(url)) {
      // Build URL
      if (url.includes("#build=")) {
        const buildId = url.split("#build=")[1];
        if (!buildId || buildId.trim() === "") {
          return null;
        }

        const ravenColonial: RavenColonial = new RavenColonial();

        try {
          // Await the remote fetch (or cached value) so that callers get the data
          const progressData = await ravenColonial.checkProgressFromRevColonial(
            buildId
          );

          if (progressData) {
            // Persist the derived progress to our DB and wait for completion
            await updateColonizationData(colonizationId, {
              isCompleted: progressData.complete,
              progress:
                ((progressData.maxNeed - progressData.sumNeed) /
                  progressData.maxNeed) *
                100,
            });

            return progressData;
          }
        } catch (error) {
          console.error(
            `Error fetching progress from Raven Colonial for build ID ${buildId}:`,
            error
          );
        }

        return null;
      }

      // System URL
      if (url.includes("#sys=")) {
        // TODO - Implement system-based updates if needed
      }
    }

    return null;
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
    // Handle expired projects (negative time)
    if (totalSeconds < 0) return "EXPIRED";

    // Handle infinite time (0 means no deadline)
    if (totalSeconds === 0) return "No deadline";

    const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
    const days = Math.floor(
      (totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60)
    );
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    const parts: string[] = [];

    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(" ") : "0m";
  }

  getFields(
    options: string[],
    values: (string | number | boolean)[],
    inline: boolean = false
  ): RestOrArray<APIEmbedField> {
    const fields: RestOrArray<APIEmbedField> = Array.from(
      Array(Math.max(options.length, values.length)),
      (_, i): APIEmbedField => {
        return { name: options[i], value: `${values[i]}`, inline: inline };
      }
    );

    return fields;
  }

  colonizationFieldEmbedMessage(
    title: string,
    options: string[],
    values: (string | number | boolean)[],
    inline: boolean = false
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
      const userInteracted = await this.interaction.guild?.members.fetch(
        targetUserId
      );
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
    participantIds: string[]
  ): Promise<string[]> {
    const nicknames: string[] = [];
    for (const participantId of participantIds) {
      try {
        // Check if the participantId is a Discord snowflake (numeric string)
        const isSnowflake = /^\d+$/.test(participantId);

        if (isSnowflake) {
          // It's a proper Discord user ID, fetch the member
          const userMember = await this.interaction.guild?.members.fetch(
            participantId
          );
          const nickname =
            userMember?.nickname || userMember?.user.username || participantId;
          nicknames.push(nickname);
        } else {
          // It's likely an old entry with nickname/username, use it directly
          // console.warn(`Found non-snowflake participant ID: ${participantId} - treating as legacy nickname`);
          nicknames.push(participantId);
        }
      } catch (error) {
        console.warn(
          `Error fetching nickname for user ${participantId}:`,
          error
        );
        nicknames.push(participantId); // Fallback to the ID/nickname as-is
      }
    }
    return nicknames;
  }
}
