import { ButtonInteraction } from "discord.js";
import {
  getColonizationDataByProjectName,
  participateInColonizationData,
} from "../../../utils/database";

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

    const username = interaction.user.username;

    try {
      await participateInColonizationData(selectedProject.id, username);

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
