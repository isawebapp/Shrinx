import { useState } from 'react';
import Head from 'next/head';

export default function Success({ path, domain }) {
  const shortUrl = `${domain}/url/${path}`;
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Success · Shrinx</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2">URL Created!</h1>
          <p className="text-gray-600 text-center mb-6">
            Your shortened URL is ready to share
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm font-mono break-all text-center">{shortUrl}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={copyToClipboard}
              className={`py-3 px-4 rounded-lg font-medium ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            
            <button
              onClick={() => (window.location.href = "/")}
              className="py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              New Short URL
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const { path = "", domain = "" } = query;
  return {
    props: {
      path,
      domain,
    },
  };
}
