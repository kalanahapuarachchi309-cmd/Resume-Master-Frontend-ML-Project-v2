import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className='bg-white border-b border-slate-200 h-16 flex items-center px-6'>
      <Link to='/' className='flex items-center gap-2'>
        <Sparkles className='w-5 h-5 text-blue-600' />
        <span className='font-bold text-lg text-blue-700'>ResumeMaster</span>
      </Link>
    </nav>
  );
}
