"use client";

import axios from "axios";
import { useState } from "react";

interface ChatMessage {
  role: "user" | "aiResponse";
  text: string;
}

export default function Home() {
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  async function generateButtonHandler() {
    if (!userQuestion?.trim()) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userQuestion },
    ]);
    setLoader(true);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
        method: "POST",
        data: {
          contents: [{ role: "user", parts: [{ text: userQuestion }] }],
        },
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "aiResponse",
          text: response.data.candidates[0].content.parts[0].text,
        },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setLoader(false);
      setUserQuestion("");
    }
  }

  const truncateText = (text: string) => {
    const words = text.split(" ");
    if (words.length > 50) {
      return words.slice(0, 50).join(" ") + "...";
    }
    return text;
  };
  console.log(process.env.API_KEY);
  
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
            className="text-5xl cursor-pointer bg-slate-600 pl-1 text-white w-12 h-12 rounded-full"
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
                  <div>
                    {expandedIndex === index
                      ? message.text
                      : truncateText(message.text)}
                    {message.text.length > 50 && (
                      <button
                        onClick={() => {
                          expandedIndex === index
                            ? setExpandedIndex(null)
                            : setExpandedIndex(index);
                        }}
                        className="text-blue-600 ml-2"
                      >
                        {expandedIndex === index ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
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
