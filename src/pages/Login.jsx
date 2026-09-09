import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
      <div className='max-w-md w-full p-8 bg-white rounded-2xl shadow-sm'>
        <h2 className='text-2xl font-bold text-center'>Sign in</h2>
      </div>
    </div>
  );
}
