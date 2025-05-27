import React from "react";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-muted py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-y-8">

        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                <path fill="#42a5f5" d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"></path>
                </svg>  
                 <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
                     Aspire UI
                </Link> 
            </div>
        </div>

        

        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Facebook">
            <Facebook className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Twitter">
            <Twitter className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Email">
            <Mail className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
