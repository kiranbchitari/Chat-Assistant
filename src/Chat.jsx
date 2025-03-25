import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Chat() {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (task) => {
    if (!apiKey) {
      alert('Please enter your API key.');
      return;
    }

    setLoading(true);
    try {
      const prompt = task === 'proofread' 
        ? `Convert the following text into simple, natural English. If it's in Hindi or a mix of Hindi and English, translate it to English without changing the meaning. 
           Keep it casual by making small mistakes and avoiding some punctuation. Add '...' where it feels natural. Don't use fancy English or extra words. 
           Only return the transformed text, no explanations:\n\n"${input}"`
        : input;

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,  // Use user-entered API key
            'Content-Type': 'application/json',
          },
        }
      );

      setResponse(res.data.choices[0]?.message?.content.trim() || 'No response');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred!');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div className="card shadow-lg p-4 w-100 rounded-4 border-0" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-3 text-primary">Chat Assistant</h2>

        {/* API Key Input */}
        <input
          type="password"
          className="form-control mb-3 rounded-3 border-0 shadow-sm"
          placeholder="Enter your API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        {/* Message Input */}
        <textarea 
          className="form-control mb-3 rounded-3 border-0 shadow-sm"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          rows={6} 
          placeholder="Type your message here..."
          style={{ minHeight: '120px' }} 
        />

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button className="btn btn-primary flex-fill shadow-sm" onClick={() => sendMessage('chat')} disabled={loading || !apiKey}>
            Send
          </button>
          <button className="btn btn-secondary flex-fill shadow-sm" onClick={() => sendMessage('proofread')} disabled={loading || !apiKey}>
            Proofread
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="alert alert-light mt-3 p-3 rounded-3 shadow-sm">
            <p className="mb-2 text-muted text-wrap"><strong>Response:</strong> {loading ? 'Loading...' : response}</p>
            {!loading && (
              <div className="d-flex justify-content-end">
                <button className="btn btn-outline-primary btn-sm shadow-sm" onClick={copyToClipboard}>
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
