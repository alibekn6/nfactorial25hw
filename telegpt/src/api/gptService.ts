export interface GPTMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GPTResponse {
  content: string;
}

export async function sendChatCompletion(
  messages: GPTMessage[]
): Promise<GPTResponse> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error status:", res.status, text);
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { role: string; content: string } }>;
  };

  return {
    content: data.choices[0].message.content.trim(),
  };
}
