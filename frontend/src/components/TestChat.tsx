// TestChat.tsx - Simple component to test backend connection
// Place this in frontend/src/components/TestChat.tsx

import React, { useState } from 'react';

const TestChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    setDebugInfo({});

    const requestData = {
      message: message || 'Hello, test message',
      user_id: 'test_user_123'
    };

    try {
      console.log('Sending request to:', `${API_URL}/api/chat`);
      console.log('Request data:', requestData);

      const startTime = Date.now();

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseTime = Date.now() - startTime;

      const responseData = await res.json();

      setDebugInfo({
        url: `${API_URL}/api/chat`,
        method: 'POST',
        status: res.status,
        statusText: res.statusText,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(res.headers.entries()),
        requestData,
        responseData
      });

      if (res.ok) {
        setResponse(responseData.response || JSON.stringify(responseData));
      } else {
        setError(`Error ${res.status}: ${res.statusText}`);
      }

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      setDebugInfo({
        error: err.message,
        errorType: err.name,
        url: `${API_URL}/api/chat`,
        possibleCause: err.message.includes('Failed to fetch')
          ? 'Backend server not running or CORS issue'
          : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      alert(`Health check: ${JSON.stringify(data)}`);
    } catch (err: any) {
      alert(`Health check failed: ${err.message}`);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h2>🧪 Backend Connection Test</h2>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>API URL:</strong> {API_URL}</p>
        <button onClick={testHealthCheck} style={{ marginRight: '10px' }}>
          Test Health Endpoint
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter test message..."
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px'
          }}
        />
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Chat Endpoint'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #f44336'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #4caf50'
        }}>
          <strong>✅ Response:</strong> {response}
        </div>
      )}

      {Object.keys(debugInfo).length > 0 && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          border: '1px solid #ddd',
          overflowX: 'auto'
        }}>
          <strong>Debug Information:</strong>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Make sure backend is running: <code>uvicorn main:app --reload</code></li>
          <li>Check CORS is configured in backend/main.py</li>
          <li>Verify REACT_APP_API_URL in frontend/.env</li>
          <li>Open browser console (F12) for more details</li>
        </ul>
      </div>
    </div>
  );
};

export default TestChat;

// To use this component, add it to your App.tsx:
// import TestChat from './components/TestChat';
// Then add <TestChat /> somewhere in your app