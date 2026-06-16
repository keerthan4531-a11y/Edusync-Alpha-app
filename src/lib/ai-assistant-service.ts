import { generateResponse, type INIXAMessage } from "./inixa-ai";

export async function performCodeReview(fileContent: string, language: string, fileName: string, userId?: string, role?: string) {
  const systemPrompt = `You are a professional software engineer. Perform a code review for the given code file.
Analyze the code for:
1. Security vulnerabilities (e.g. injection, data leaks, unsafe operations)
2. Performance optimizations (e.g. time/space complexity improvements)
3. Best practices, formatting, naming conventions, and clean code principles.
Provide the feedback in clear Markdown formatting, structured with headers like Security Analysis, Performance Analysis, and Best Practices.`;

  const userPrompt = `Filename: ${fileName}
Language: ${language}

Code:
\`\`\`${language}
${fileContent}
\`\`\``;

  const messages: INIXAMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await generateResponse(messages, {
    stage: 'stage-2',
    feature: 'code-review',
    userId,
    role
  });

  return {
    mode: "code-review",
    response: result.response,
  };
}

export async function getArchitectureSuggestions(projectContext: string, userId?: string, role?: string) {
  const messages: INIXAMessage[] = [
    {
      role: 'system',
      content: 'You are a senior software architect. Provide architecture suggestions for the given project context. Be specific and practical.'
    },
    {
      role: 'user',
      content: projectContext || 'Provide general architecture best practices for a web application project.'
    },
  ];

  const result = await generateResponse(messages, {
    stage: 'stage-3',
    feature: 'idea-gen',
    userId,
    role
  });

  return {
    mode: "architecture",
    response: result.response,
  };
}

export async function generateProjectIdeas(problemStatementId?: string, currentIdea?: string, userId?: string, role?: string) {
  const systemPrompt = `Generate 3 innovative software engineering project ideas. For each idea, provide:
1. Title
2. Short description (2-3 sentences)
3. Recommended technology stack
Ensure formatting is clean markdown.`;

  const userPrompt = `${problemStatementId ? `For Problem Statement ID: ${problemStatementId}` : ""}
${currentIdea ? `Inspiration: "${currentIdea}"` : "Generate creative and practical project ideas for college students."}`;

  const messages: INIXAMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await generateResponse(messages, {
    stage: 'stage-3',
    feature: 'idea-gen',
    userId,
    role
  });

  return {
    mode: "idea-gen",
    response: result.response,
  };
}
