import { type ModelMessage } from "ai";

export const filterEmptyMessages = (messages: ModelMessage[]) => {
  return messages.filter((message) => {
    const hasValidContent = Array.isArray(message.content)
      ? message.content.some(
          (content) =>
            content.type === "text" &&
            content.text !== undefined &&
            content.text !== null &&
            content.text.trim() !== ""
        )
      : message.content !== undefined &&
        message.content !== null &&
        message.content.trim() !== "";

    return hasValidContent;
  });
};
