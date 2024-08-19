"use client"

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "aiResponse";
  text: string;
}

export default function Home() {
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loader, setLoader] = useState<boolean>(false);

  const generateButtonHandler = async () => {
    if (!userQuestion.trim()) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userQuestion },
      { role: "aiResponse", text: "" }, 
    ]);

    setLoader(true);

    const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream(userQuestion);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      setMessages((prevMessages) => {
        // console.log(prevMessages);
        return prevMessages.map((message, index) =>
          index === prevMessages.length - 1
            ? { ...message, text: message.text + chunkText }
            : message
        );
      });
    }


    setLoader(false);
    setUserQuestion("");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-4">
        <h1 className="font-bold text-2xl mb-2">Let's Chat with AI</h1>
        <div className="flex items-center space-x-2 w-full max-w-3xl">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            className="h-12 flex-grow border border-black rounded-md p-2"
            placeholder="Message here"
          />
          <p
            onClick={generateButtonHandler}
            className="text-5xl cursor-pointer bg-slate-500 pl-1 text-white w-12 h-12 rounded-full"
          >
            ↑
          </p>
        </div>

        {loader && (
          <p className="text-lg font-semibold mt-2 text-gray-700 animate-pulse">
            Loading...
          </p>
        )}
        {messages.length > 0 && (
          <div className="mt-4 mb-4 w-5/6 p-4 border border-black bg-white rounded-md">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`my-2 p-2 rounded-md ${
                  message.role === "user"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.role === "aiResponse" ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
