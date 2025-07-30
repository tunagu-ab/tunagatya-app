'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <Link href="/mypage" className="text-gray-700 hover:text-blue-600 transition duration-300">
            マイページ
          </Link>
          <span className="text-gray-500">|</span>
          <span className="text-gray-700">{user.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300">
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
