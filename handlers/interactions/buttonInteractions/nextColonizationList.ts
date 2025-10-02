import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import {
  getAllColonizationData,
  getParticipantsByColonizationId,
  countColonizationActiveProjects,
} from "../../../utils/database";
import CreateButtons from "../utils/createButtons";
import EDSM from "../../../utils/edsm";
import { Position, SystemInfo } from "../../../utils/models";

/**
 * Handles colonization list pagination - shows next page of colonization projects
 * @param interaction Button Interaction
 */
async function nextColonizationList(interaction: ButtonInteraction) {
  try {
    await interaction.deferUpdate();

    // Parse the custom ID to extract page number and filters
    const customIdParts = interaction.customId.split("_");

    let page = 1;
    let filtersJson = "{}";

    // Handle different button formats
    if (interaction.customId.startsWith("next_colonization_list_")) {
      // Format: next_colonization_list_page_filters
      page = parseInt(customIdParts[3]) || 1;
      if (customIdParts.length > 4) {
        filtersJson = customIdParts.slice(4).join("_");
      }
    } else if (interaction.customId.startsWith("prev_colonization_list_")) {
      // Format: prev_colonization_list_page_filters
      page = parseInt(customIdParts[3]) || 1;
      if (customIdParts.length > 4) {
        filtersJson = customIdParts.slice(4).join("_");
      }
    } else {
      // Old format - try to extract page from footer text if available
      const embed = interaction.message.embeds[0];
      if (embed?.footer?.text) {
        const footerMatch = embed.footer.text.match(/Page (\d+) of (\d+)/);
        if (footerMatch) {
          page = parseInt(footerMatch[1]) + 1; // Next page
        }
      }
    }

    // Parse filters
    let filters: {
      projectName?: string;
      architectName?: string;
      referenceSystem?: string;
    } = {};
    try {
      filters = JSON.parse(filtersJson);
    } catch (error) {
      console.warn("Failed to parse filters from button ID:", error);
    }

    const { projectName, architectName, referenceSystem } = filters;

    const dismissButton = new CreateButtons().createDismissButton();

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
      page,
      5,
      projectName || undefined,
      architectName || undefined,
      position || undefined,
    );

    if (activeProjects.length === 0) {
      await interaction.editReply({
        content: "No more colonization projects found.",
        components: [dismissButton],
        embeds: [],
      });
      return;
    }

    // Get participants for all projects
    const participantNames = await Promise.all(
      activeProjects.map(async (project) => {
        const participantIds = await getParticipantsByColonizationId(
          project.id,
        );
        const participantNicknames = await getParticipantNicknames(
          participantIds,
          interaction,
        );
        return {
          [project.id]: participantNicknames,
        };
      }),
    );

    const totalProjects = await countColonizationActiveProjects();
    const totalPages = Math.ceil(totalProjects / 5);

    const embed = new EmbedBuilder()
      .setTitle("Active Colonization Projects")
      .setColor(0x00ff00)
      .setTimestamp();

    activeProjects.forEach((project, index) => {
      const timeLeftFormatted = formatTimeFromSeconds(
        project.timeLeft || Infinity,
      );

      // Find participants for this project
      const projectParticipants =
        participantNames.find((p) => p[project.id])?.[project.id] || [];
      const participantsText =
        projectParticipants.length > 0
          ? `\nParticipants: ${projectParticipants.join("\n")}`
          : "";

      // Calculate distance if reference system is provided
      let distanceText = "";
      if (
        position &&
        project.positionX !== null &&
        project.positionY !== null &&
        project.positionZ !== null
      ) {
        const distance = calculateDistance(position, {
          x: project.positionX,
          y: project.positionY,
          z: project.positionZ,
        });
        distanceText = `\nDistance: ${distance.toFixed(2)} Ly`;
      } else if (position) {
        distanceText = `\nDistance: ∞ Ly (coordinates unavailable)`;
      }

      // Calculate the actual project number across all pages
      const projectNumber = (page - 1) * 5 + index + 1;

      embed.addFields({
        name: `**${projectNumber}.** Project Name: ${project.projectName}\nSystem Name: ${project.systemName}`,
        value: `Architect: ${project.architect}\nProgress: ${
          project.progress
        }%\nPrimary Port: ${
          project.isPrimaryPort ? "Yes" : "No"
        }\nStarport Type: ${
          project.starPortType
        }\nTime Left: ${timeLeftFormatted}${distanceText}${participantsText}\n${
          project.srv_survey_link ? `[Link](${project.srv_survey_link})\n` : ""
        }${project.notes ? `\nNotes: ${project.notes}` : ""}`,
      });
    });

    if (referenceSystem) {
      embed.setDescription(`Reference System: **${referenceSystem}**`);
    }

    // Create button components with proper row distribution
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    // First row: Navigation buttons and project selection buttons
    const firstRow = new ActionRowBuilder<ButtonBuilder>();

    // Previous button (if not on first page)
    if (page > 1) {
      const prevButton = new ButtonBuilder()
        .setCustomId(
          `prev_colonization_list_${page - 1}_${JSON.stringify(filters)}`,
        )
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary);
      firstRow.addComponents(prevButton);
    }

    // Next button (if not on last page)
    if (page < totalPages) {
      const nextButton = new ButtonBuilder()
        .setCustomId(
          `${AppSettings.BUTTON_NEXT_COLONIZATION_LIST_ID}_${
            page + 1
          }_${JSON.stringify(filters)}`,
        )
        .setLabel(AppSettings.BUTTON_NEXT_COLONIZATION_LIST_LABEL)
        .setStyle(ButtonStyle.Primary);
      firstRow.addComponents(nextButton);
    }

    // Add up to remaining slots for project selection buttons
    const maxProjectButtonsInFirstRow = Math.min(
      5 - firstRow.components.length,
      activeProjects.length,
    );
    for (let i = 0; i < maxProjectButtonsInFirstRow; i++) {
      const project = activeProjects[i];
      const projectNumber = (page - 1) * 5 + i + 1;
      const projectButton = new ButtonBuilder()
        .setCustomId(`colonization_list_select_${project.projectName}`)
        .setLabel(`${projectNumber}`)
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
        const projectNumber = (page - 1) * 5 + i + 1;
        const projectButton = new ButtonBuilder()
          .setCustomId(`colonization_list_select_${project.projectName}`)
          .setLabel(`${projectNumber}`)
          .setStyle(ButtonStyle.Secondary);
        secondRow.addComponents(projectButton);
      }

      // Add dismiss button
      secondRow.addComponents(dismissButton.components[0]);
      components.push(secondRow);
    }

    embed.setFooter({
      text: `Page ${page} of ${totalPages}`,
    });

    await interaction.editReply({ embeds: [embed], components });
  } catch (error) {
    console.error("Error handling next colonization list:", error);
    // Use editReply if already replied/deferred, otherwise use reply
    if (interaction.replied || interaction.deferred) {
      await interaction
        .editReply({
          content: "An error occurred while navigating to the next page.",
          components: [],
          embeds: [],
        })
        .catch(() => {
          console.error("Failed to edit reply:", error);
        });
    } else {
      await interaction
        .reply({
          content: "An error occurred while navigating to the next page.",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {
          console.error("Failed to send reply:", error);
        });
    }
  }
}

// Helper functions (copied from colonization.ts for reuse)
function formatTimeFromSeconds(totalSeconds: number): string {
  if (totalSeconds === 0) return "0m";

  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  const parts: string[] = [];

  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

async function getParticipantNicknames(
  participantIds: string[],
  interaction: ButtonInteraction,
): Promise<string[]> {
  const nicknames: string[] = [];
  for (const participantId of participantIds) {
    try {
      // Check if the participantId is a Discord snowflake (numeric string)
      const isSnowflake = /^\d+$/.test(participantId);

      if (isSnowflake) {
        // It's a proper Discord user ID, fetch the member
        const userMember =
          await interaction.guild?.members.fetch(participantId);
        const nickname =
          userMember?.nickname || userMember?.user.username || participantId;
        nicknames.push(nickname);
      } else {
        // It's likely a legacy nickname, use as-is
        nicknames.push(participantId);
      }
    } catch (error) {
      console.error(
        `Error fetching nickname for user ${participantId}:`,
        error,
      );
      nicknames.push(participantId); // Fallback to the ID/nickname as-is
    }
  }
  return nicknames;
}

export default nextColonizationList;
