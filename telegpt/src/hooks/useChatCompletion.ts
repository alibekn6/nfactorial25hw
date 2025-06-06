// src/hooks/useChatCompletion.ts

import { useMutation } from "@tanstack/react-query";
import { type GPTMessage, type GPTResponse, sendChatCompletion } from "../api/gptService";

interface UseChatCompletionParams {
  onSuccess: (assistantText: string) => void;
  onError?: (error: Error) => void;
}

export function useChatCompletion({ onSuccess, onError }: UseChatCompletionParams) {
  const mutation = useMutation<
    GPTResponse,
    Error,
    GPTMessage[]
  >({
    mutationFn: (messages) => sendChatCompletion(messages),
    onSuccess: (data) => {
      onSuccess(data.content);
    },
    onError: (error) => {
      console.error("Ошибка при получении ответа от GPT:", error);
      if (onError) onError(error);
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
  };
}
