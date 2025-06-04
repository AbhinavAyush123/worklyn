import { SignIn } from '@clerk/nextjs';
import React from 'react';

function page() {
  return (
    <section className="bg-white">
      <div>
     
       
          <div className="max-w-md w-full">
            {/* <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl mb-8 text-center mr-[35px]">
              Welcome to JobSpot
            </h1> */}


            <SignIn redirectUrl = "/dashboard"
              appearance={{
                elements: {
                  card: "shadow-lg w-full",
                },
              }}
            />
          </div>
     

    
      </div>
    </section>
  );
}

export default page;
