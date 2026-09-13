import React, { useState } from 'react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  return (
    <div className='max-w-4xl mx-auto py-8'>
      <h1 className='text-2xl font-bold'>Upload Your Resume</h1>
    </div>
  );
}
