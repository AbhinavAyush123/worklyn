"use client"
import { useState } from 'react';
import { FiSearch, FiEdit2 } from 'react-icons/fi';
import { FaPhone, FaVideo, FaInfoCircle } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

export default function ChatUI() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-purple-900 text-white flex flex-col">
        <div className="p-4 flex items-center space-x-2">
          <img
            src="https://i.pravatar.cc/40"
            className="w-10 h-10 rounded-full"
            alt="Avatar"
          />
          <FiSearch className="ml-auto text-lg cursor-pointer" />
        </div>
        <div className="px-4">
          <input
            type="text"
            placeholder="Search Conversations"
            className="w-full p-2 rounded bg-purple-800 text-sm"
          />
        </div>
        <div className="mt-4 overflow-y-auto">
          {['Art Williams', 'Nick Blanche', 'Richard McMasters', 'Michael Wong'].map((name, index) => (
            <div
              key={index}
              className="p-4 flex items-center hover:bg-purple-800 cursor-pointer"
            >
              <img
                src={`https://i.pravatar.cc/40?img=${index + 1}`}
                className="w-10 h-10 rounded-full mr-3"
                alt="Avatar"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-purple-300">Typing...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="w-2/4 flex flex-col border-l border-r">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <img
              src="https://i.pravatar.cc/40?img=4"
              className="w-10 h-10 rounded-full"
              alt="Avatar"
            />
            <div>
              <p className="font-semibold">Michael Wong</p>
              <p className="text-green-500 text-sm">Online</p>
            </div>
          </div>
          <div className="flex space-x-4 text-gray-600">
            <FaPhone className="cursor-pointer" />
            <FaVideo className="cursor-pointer" />
            <FaInfoCircle className="cursor-pointer" />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          <div className="flex">
            <div className="bg-gray-200 p-2 rounded-lg max-w-xs">
              Hey Nikola, I just want to welcome you to the community.
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-purple-600 text-white p-2 rounded-lg max-w-xs">
              Thanks Mizko, I'm glad to be here.
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-purple-600 text-white p-2 rounded-lg max-w-xs">
              Hey Mizko, this is my design for this weeks UI competition.
            </div>
          </div>
          <div className="flex justify-end">
            <img
              src="https://via.placeholder.com/150"
              alt="Screenshot"
              className="rounded-lg w-40"
            />
          </div>
          <div className="flex justify-end">
            <div className="bg-purple-600 text-white p-2 rounded-lg max-w-xs">
              What do you think?
            </div>
          </div>
          <div className="flex">
            <div className="bg-gray-200 p-2 rounded-lg max-w-xs">
              Nice! Can you send this to
              <a href="mailto:thedesignership.comps@gmail.com" className="text-blue-500"> thedesignership.comps@gmail.com</a>?
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 rounded border"
          />
          <button className="ml-2 text-purple-600">
            <IoMdSend size={24} />
          </button>
        </div>
      </div>

      {/* Profile Panel */}
      <div className="w-1/4 p-4">
        <div className="flex flex-col items-center text-center">
          <img
            src="https://i.pravatar.cc/100"
            className="w-24 h-24 rounded-full"
            alt="Profile"
          />
          <h2 className="text-xl font-semibold mt-2">Michael Wong</h2>
          <p className="text-gray-500">UX/UI Designer</p>
          <button className="mt-2 px-3 py-1 border rounded text-sm flex items-center">
            <FiEdit2 className="mr-1" /> Edit Profile
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <p><strong>Mobile:</strong> +430 332 4567</p>
          <p><strong>Email:</strong> mizko@gmail.com</p>
          <p><strong>Date of Birth:</strong> 02/12/1990</p>
          <p><strong>Gender:</strong> Male</p>
        </div>
        <div className="mt-6">
          <p className="font-semibold mb-2">Shared Media</p>
          <div className="grid grid-cols-3 gap-2">
            <img src="https://via.placeholder.com/80" className="rounded" alt="media" />
            <img src="https://via.placeholder.com/80" className="rounded" alt="media" />
            <img src="https://via.placeholder.com/80" className="rounded" alt="media" />
            <img src="https://via.placeholder.com/80" className="rounded" alt="media" />
          </div>
        </div>
      </div>
    </div>
  );
}
