import React from "react";

const ChatBox = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white w-[1000px] h-[700px] m-1 rounded-xl drop-shadow-lg flex flex-col overflow-hidden">
        {/* навка */}
        <div className="border text-lg border-gray-300 p-4">
          <h2>Shlakoblokyn'</h2>
        </div>
        {/* Заголовок */}
        <h3 className="text-center text-2xl font-semibold mt-6">AIchat</h3>

        {/* Таблички */}
        <div className="flex justify-center items-start gap-6 my-6 px-6">
          <div className="border-2 border-gray-300 rounded-xl p-6 w-64 h-40 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Prevention</h2>
            <p className="text-sm text-gray-700">
              Helping you monitor your health and prevent illnesses in advance.
            </p>
          </div>
          <div className="border-2 border-gray-300 rounded-xl p-6 w-64 h-40 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Your Friend</h2>
            <p className="text-sm text-gray-700">
              Your trusted medical friend and helper is always there for you.
            </p>
          </div>
          <div className="border-2 border-gray-300 rounded-xl p-6 w-64 h-40 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Reminders</h2>
            <p className="text-sm text-gray-700">
              Reminding you on time to take your medications and see your
              doctor.
            </p>
          </div>
        </div>

        {/* чатбокс */}
        <div className="flex-1 p-4 overflow-y-auto border-b border-gray-200 flex flex-col">
          <div className="mb-2 px-3 py-2 rounded-xl max-w-[75%] bg-blue-100 self-end text-right">
            Hi doctor, I am an 18 year old boy. Last year, I made a very best
            friend. He was like my second half. He used to share each and
            everything with me. A few months back, I saw him with his
            ex-girlfriend, and they were in a relationship now. He never told me
            that. She lives near my home, and my friend always drops her to her
            home, but whenever I asked him to come to my place he used to tell
            that it is too far away. Then we had a major fight without any
            violence, and we both stopped talking. Then I started realizing that
            I like him so much. I miss him as he used to hold my hand in public
            places always. I started remaining sad the whole day. I was
            depressed, and I tried to commit suicide. After that, it is like at
            sometimes during the night I express all my warm feelings with
            anyone on chat, and after a few minutes, I regret it. I feel like
            there are two persons inside me. First I thought that it is split
            personality, but I do not have memory loss. Please help me. What
            should I do? I hate his girlfriend. But, I am not sure whether I
            love my friend or not. Sometimes, I feel like I love him and after a
            few minutes, it is like just friendship. Am I gay? But, but I have a
            crush on girls also. I think I am attracted to both boys and girls.
            I am totally confused. Please help me.
          </div>
          <div className="mb-2 px-3 py-2 rounded-xl max-w-[75%] bg-gray-100 self-start text-left">
            u r gay
          </div>
        </div>

        {/* инпт */}
        <div className="p-4 flex items-center">
          <input
            type="text"
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none"
            placeholder="Send message..."
          />
          <button className="ml-3 bg-blue-100 hover:bg-blue-200 p-2 rounded-full">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
