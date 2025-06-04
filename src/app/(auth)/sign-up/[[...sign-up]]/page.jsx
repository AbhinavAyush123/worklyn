import { SignUp } from '@clerk/nextjs';
import React from 'react';

function page() {
  return (
    <section className="bg-white">
      <div>
  

     
            <SignUp redirectUrl="/onboarding" 
              appearance={{
                elements: {
                  card: "shadow-lg w-full",
                },
              }}
            />
          </div>
       

       
     
    </section>
  );
}

export default page;
