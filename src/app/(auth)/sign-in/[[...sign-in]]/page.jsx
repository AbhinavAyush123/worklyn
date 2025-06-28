import { SignIn } from '@clerk/nextjs';
import React from 'react';
import Image from 'next/image';

function page() {
  return (
    <div className="min-h-screen flex">
      {/* Left Half - Solid Blue */}
      <div className="w-1/2 bg-blue-50 flex flex-col items-center justify-center b gap-10">
      <Image 
        src="/logo.png" 
        alt="Dashboard preview"
        width={200}
         height={200}
         className='bg-blue-600 rounded-3xl'
      />
        <h1 className="text-blue-600 text-4xl font-bold">Worklyn</h1>
      </div>

      {/* Right Half - Login */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-6">
          <SignIn redirectUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}

export default page;
