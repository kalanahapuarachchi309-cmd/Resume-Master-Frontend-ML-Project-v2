import React, { useState, useEffect } from 'react';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold'>Job Openings</h1>
    </div>
  );
}
