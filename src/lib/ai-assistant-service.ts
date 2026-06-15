// Placeholder logic for Phase D. AI integration will happen in a later phase.
// TODO: AI INTEGRATION POINT — wire up Gemini call here.

export async function performCodeReview(fileContent: string, language: string, fileName: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    mode: "code-review",
    response: `[AI integration pending]\n\nI have reviewed \`${fileName}\` (${language}).\n\n- Ensure you are using consistent naming conventions.\n- Add some comments explaining the business logic.\n- Consider modularizing long functions.`,
  };
}

export async function getArchitectureSuggestions(projectContext: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    mode: "architecture",
    response: `[AI integration pending]\n\nBased on your project files, here are some architecture suggestions:\n\n1. **Separation of Concerns**: Keep your UI components distinct from your business logic.\n2. **State Management**: Consider using a centralized store (like Zustand) if state becomes complex.\n3. **API Layer**: Centralize API calls in a dedicated \`lib/api\` or \`services\` directory.`,
  };
}

export async function generateProjectIdeas(problemStatementId?: string, currentIdea?: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    mode: "idea-gen",
    response: `[AI integration pending]\n\nHere are some ideas to brainstorm:\n\n- **Feature A**: Add real-time collaboration using WebSockets.\n- **Feature B**: Integrate an external API for richer data.\n- **Feature C**: Build an interactive dashboard to visualize the data.\n\nWhat do you think of these?`,
  };
}
