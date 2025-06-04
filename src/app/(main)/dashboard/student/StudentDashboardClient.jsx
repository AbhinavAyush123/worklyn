'use client';
import { AppSidebar } from '../components/testSide';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser
} from '@clerk/nextjs';


import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // make sure this is correct path

export default function StudentDashboardClient() {
 
  const { isSignedIn, user, isLoaded } = useUser();
  const [userTypes, setUserTypes] = useState([]);

  // Save user to DB on sign in
  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/save-user', { method: 'POST' });
    }
  }, [isSignedIn]);

  // Fetch user_types from Supabase
  useEffect(() => {
    const fetchUserTypes = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('user_types')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user types:', error.message);
      } else {
        setUserTypes(data?.user_types || []);
      }
    };

    if (user?.id) {
      fetchUserTypes();
    }
  }, [user?.id]);

  return (
    <div >
      <AppSidebar/>
      {/* <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton />
          <SignOutButton />
        </div>

        {isLoaded && user && (
          <h1 className="mt-4 text-xl font-semibold">
            Welcome, {user.firstName || 'there'}!
          </h1>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md border">
          <h2 className="text-xl font-semibold mb-2">Your Selected Types</h2>
          {userTypes.length === 0 ? (
            <p className="text-gray-500">No types selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userTypes.map((type) => (
                <span
                  key={type}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </SignedIn> */}
    </div>
  );
}
