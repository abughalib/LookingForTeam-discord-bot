import { ButtonInteraction } from "discord.js";
import {
  getColonizationDataByProjectName,
  getParticipantsByColonizationId,
  participateInColonizationData,
} from "../../../utils/database";

/**
 * Get the user's nickname or username if nickname is not available
 * @param interaction Button interaction
 * @param userId User ID to fetch nickname for
 * @returns User's server nickname or username
 */
async function getUserNickname(
  interaction: ButtonInteraction,
  userId?: string,
): Promise<string> {
  try {
    const targetUserId = userId || interaction.user.id;
    const userInteracted = await interaction.guild?.members.fetch(targetUserId);
    return userInteracted?.nickname || interaction.user.username;
  } catch (error) {
    console.error("Error fetching user nickname:", error);
    return interaction.user.username;
  }
}

/**
 * Handles colonization project selection buttons (1, 2, 3, etc.)
 * Adds the user as a participant to the selected colonization project
 * @param interaction Button Interaction
 */
async function selectColonizationProject(interaction: ButtonInteraction) {
  try {
    // Extract the project name from the customId (colonization_list_select_ProjectName -> ProjectName)
    const projectName = interaction.customId.replace(
      "colonization_list_select_",
      "",
    );

    await interaction.deferReply({ ephemeral: true });

    // Get the specific project by name
    const selectedProject = await getColonizationDataByProjectName(projectName);

    if (!selectedProject) {
      await interaction.editReply({
        content: `Colonization project **${projectName}** not found. It may have been removed or completed.`,
      });
      return;
    }

    const userNickname = await getUserNickname(interaction);

    try {
      // Check if user is already participating
      const participants = await getParticipantsByColonizationId(
        selectedProject.id,
      );
      if (participants.includes(userNickname)) {
        await interaction.editReply({
          content: `You are already participating in the colonization project **${selectedProject.projectName}**.`,
        });
        return;
      }

      await participateInColonizationData(selectedProject.id, userNickname);

      await interaction.editReply({
        content: `You have successfully joined the colonization project **${selectedProject.projectName}** in **${selectedProject.systemName}**!`,
      });
    } catch (participationError) {
      console.error(
        "Error participating in colonization project:",
        participationError,
      );

      // Check if it's a duplicate participation error
      const errorMessage =
        participationError instanceof Error
          ? participationError.message
          : String(participationError);
      if (
        errorMessage.includes("UNIQUE constraint failed") ||
        errorMessage.includes("already exists")
      ) {
        await interaction.editReply({
          content: `You are already participating in the colonization project **${selectedProject.projectName}**.`,
        });
      } else {
        await interaction.editReply({
          content: `Failed to join the colonization project **${selectedProject.projectName}**. Please try again later.`,
        });
      }
    }
  } catch (error) {
    console.error("Error handling colonization project selection:", error);
    // Use editReply if already deferred, otherwise use reply
    if (interaction.replied || interaction.deferred) {
      await interaction
        .editReply({
          content:
            "An error occurred while selecting the project. Please try again.",
        })
        .catch(() => {
          console.error("Failed to edit reply:", error);
        });
    } else {
      await interaction
        .reply({
          content:
            "An error occurred while selecting the project. Please try again.",
          ephemeral: true,
        })
        .catch(() => {
          console.error("Failed to send reply:", error);
        });
    }
  }
}

export default selectColonizationProject;
