import { ButtonInteraction } from "discord.js";

/**
 * Handles colonization list pagination - shows next page of colonization projects
 * @param interaction Button Interaction
 */
async function nextColonizationList(interaction: ButtonInteraction) {
  try {
    // For now, just reply that pagination is not fully implemented
    // This would need to be enhanced to track current page and show next page
    await interaction.reply({
      content:
        "Pagination for colonization list is not fully implemented yet. Please use the `/colonization_list` command again to refresh the list.",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling next colonization list:", error);
    await interaction
      .reply({
        content: "An error occurred while navigating to the next page.",
        ephemeral: true,
      })
      .catch(() => {});
  }
}

export default nextColonizationList;
