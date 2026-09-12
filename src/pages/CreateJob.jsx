import React, { useState } from 'react';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  return (
    <div className='max-w-3xl mx-auto py-8'>
      <h1 className='text-2xl font-bold'>Post a New Vacancy</h1>
    </div>
  );
}
