// "use client";

// import { useEffect, useRef, useState } from "react";

// export default function Home() {
//   const [userInput, setUserInput] = useState("");
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>(
//     []
//   );
//   const [loading, setLoading] = useState(false);

//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const formatMarkdown = (text: string) => {
//     return text
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold markdown
//       .replace(/\n/g, "<br />"); // line breaks
//   };

//   const sendMessage = async () => {
//     if (!userInput.trim()) return;
//     setMessages([...messages, { role: "user", content: userInput }]);
//     setUserInput("");
//     setLoading(true);

//     const res = await fetch("/api/gemini", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         messages: [...messages, { role: "user", content: userInput }],
//       }),
//     });

//     const data = await res.json();
//     setMessages([
//       ...messages,
//       { role: "user", content: userInput },
//       { role: "ai", content: data.reply },
//     ]);
//     setLoading(false);
//   };

//   return (
//     <main className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">🐾 AI Vet Assistant</h1>
//       <div className="space-y-4 border p-4 rounded-xl bg-gray-100 max-h-[70vh] overflow-y-auto">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`px-2 py-1 rounded-xl text-black ${
//               msg.role === "user"
//                 ? "bg-gray-50 text-left"
//                 : "bg-gray-50 text-left"
//             }`}
//           >
//             <div ref={bottomRef} />
//             <p
//               className="text-sm"
//               dangerouslySetInnerHTML={{
//                 __html: `<strong>${
//                   msg.role === "user" ? "You" : "VetBot"
//                 }:</strong> ${formatMarkdown(msg.content)}`,
//               }}
//             ></p>
//           </div>
//         ))}
//         {loading && (
//           <p className="text-sm text-gray-500">VetBot is thinking...</p>
//         )}
//       </div>
//       <div className="mt-4 flex gap-2">
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Describe your pet's symptoms..."
//           className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
//         >
//           Send
//         </button>
//       </div>
//     </main>
//   );
// }

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!userInput.trim() && !imageBase64) return;
    setMessages([...messages, { role: "user", content: userInput }]);
    setUserInput("");
    setLoading(true);

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: userInput }],
        imageBase64,
      }),
    });

    const data = await res.json();
    setMessages([
      ...messages,
      { role: "user", content: userInput },
      { role: "ai", content: data.reply },
    ]);
    setImageBase64(null);
    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="font-sans min-h-screen bg-gray-800 flex flex-col justify-between">
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🐾 AI Vet Assistant</h1>
        <div className="space-y-4 border p-4 rounded-xl bg-gray-100 max-h-[70vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl text-black ${
                msg.role === "user"
                  ? "bg-gray-50 text-left"
                  : "bg-gray-50 text-left"
              }`}
            >
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: `<strong>${
                    msg.role === "user" ? "You" : "VetBot"
                  }:</strong> ${formatMarkdown(msg.content)}`,
                }}
              ></p>
            </div>
          ))}
          {loading && (
            <p className="text-sm text-gray-500">VetBot is thinking...</p>
          )}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full">
          {/* Text input */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe your pet's symptoms..."
            className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Image input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full sm:w-auto text-sm text-gray-100 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-600 file:text-sm"
          />

          {/* Button */}
          <button
            onClick={sendMessage}
            className="w-full sm:w-auto cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </main>
      <footer className="text-sm font-sans text-center text-gray-200 flex gap-1 justify-center items-center py-2">
        Created with <span className="animate-pulse text-pink-700">❤</span> by{" "}
        <Link
          href="https://github.com/Adil-Soomro"
          className="hover:text-blue-500 cursor-pointer transition-all duration-300 ease-in-out"
        >
          Adil Soomro
        </Link>
      </footer>
    </div>
  );
}
