import { esChat } from "./es-engine";

export const getGeminiModel = (modelName = "surfsense/gpt-5.4-mini-no-login") => {
  return {
    generateContent: async (promptOrContent: any) => {
      let promptText = "";
      if (typeof promptOrContent === "string") {
        promptText = promptOrContent;
      } else if (Array.isArray(promptOrContent)) {
        promptText = promptOrContent.map((p) => (typeof p === "string" ? p : JSON.stringify(p))).join("\n");
      } else if (promptOrContent?.contents) {
        promptText = JSON.stringify(promptOrContent.contents);
      } else {
        promptText = String(promptOrContent);
      }

      const textResponse = await esChat([{ role: "user", content: promptText }]);
      return {
        response: {
          text: () => textResponse,
        },
      };
    },
  };
};
