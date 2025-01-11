import React, { useState } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { ClipLoader } from 'react-spinners';

const ApiComponent = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading

  const handleSubmit = async () => {
    setLoading(true); // Set loading to true when API request starts
    const apiKey = process.env.VITE_API_KEY; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const result = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', result);
      
      const content =
        result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResponse(content);

      // Extract code from the response
      setCode(extractCode(content));
      setError(null);
    } catch (err) {
      setError(err.message || 'Something went wrong!');
      setResponse('');
    } finally {
      setLoading(false); // Set loading to false when request finishes
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  // Function to extract code from the response
  const extractCode = (content) => {
    const codeRegex = /```(.*?)```/gs;
    const match = content.match(codeRegex);
    if (match) {
      return match
        .map((code) => code.replace(/```/g, '').trim())  // Remove backticks and trim whitespace
        .join('\n');  // Join multiple code blocks if necessary
    }
    return '';
  };

  return (
    <div className="container mx-auto p-6 bg-gray-800 min-h-screen">
      <h1 className="text-3xl text-center text-white font-semibold mb-6">
        Generate Code and Explanation
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="w-full p-4 border rounded-md shadow-sm mb-4 bg-gray-700 text-white"
        />
        <button
          onClick={handleSubmit}
          className="w-full p-4 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none mb-6"
        >
          Generate
        </button>

        {loading && (
          <div className="text-center mb-6">
            <ClipLoader size={50} color="#fff" loading={loading} />
            <p className="mt-2 text-white">Processing your request...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-200 text-red-800 p-4 rounded-md mb-6">
            <strong>Error: </strong> {error}
          </div>
        )}

        {response && (
          <div className="bg-gray-900 text-white shadow-md p-6 rounded-lg mt-6">
            {/* Explanation Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Explanation (Markdown Format)</h2>
              <div className="prose text-white">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>

            {/* Code Block Section */}
            {code && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Code Snippet</h3>
                <SyntaxHighlighter
                  language="php"
                  style={vscDarkPlus}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#1E293B',  // Darker background for the code block
                    border: '1px solid #374151', // Border color
                  }}
                >
                  {code}
                </SyntaxHighlighter>
                <button
                  onClick={() => handleCopy(code)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none"
                >
                  Copy Code
                </button>
              </div>
            )}

            {/* Sections for Model, View, Controller Files */}
            <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Model File:</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-md">
                {`class ExampleModel { // Logic for fetching data }`}
              </pre>

              <h3 className="text-lg font-semibold text-white mb-4">View File:</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-md">
                {`<div>{{ data }}</div>`}
              </pre>

              <h3 className="text-lg font-semibold text-white mb-4">Controller File:</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-md">
                {`public function show($id) { return view('viewName', ['data' => $data]); }`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiComponent;
