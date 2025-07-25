import { SignUp } from '@clerk/nextjs';
import React from 'react';

function page() {
  return (
    <div className="min-h-screen flex">
      {/* Left Half - Solid Blue */}
      <div className="w-1/2 bg-blue-50 flex items-center justify-center b">
        <h1 className="text-blue-600 text-4xl font-bold">Worklyn</h1>
      </div>

      {/* Right Half - Login */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-6">
          <SignUp redirectUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}

export default page;
