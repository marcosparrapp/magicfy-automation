
import React, { useState } from 'react';
import { addOrder } from '../services/murphyApi';
import { Loader } from './Loader';
import { CheckCircleIcon, ExclamationIcon } from './icons';

interface AdminPortalProps {
  apiKey: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ apiKey }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [productIds, setProductIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setMessage({ type: 'error', text: 'Please enter your API Key in the header.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await addOrder(apiKey, firstName, lastName, email, productIds);
    setLoading(false);
    if (result.message === 'success') {
      setMessage({ type: 'success', text: 'Order added successfully!' });
      setFirstName('');
      setLastName('');
      setEmail('');
      setProductIds('');
    } else {
      setMessage({ type: 'error', text: result.error || 'An unknown error occurred.' });
    }
  };

  return (
    <div className="bg-brand-secondary p-6 md:p-8 rounded-lg shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-brand-highlight">Add Customer Purchase</h2>
      <p className="text-center text-gray-400 mb-6 -mt-4">Manually add a download purchase to a customer's account after they order on your store.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field" />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field" />
        </div>
        <input type="email" placeholder="Customer Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
        <input type="text" placeholder="Comma-separated Product IDs (e.g., 45234,34555)" value={productIds} onChange={(e) => setProductIds(e.target.value)} required className="input-field" />
        <button type="submit" disabled={loading} className="w-full bg-brand-highlight text-white font-bold py-3 rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center">
          {loading ? <Loader /> : 'Add Order'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationIcon className="w-6 h-6" />}
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
};

// Add a shared style for input fields
const globalStyles = `
  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #1a1a2e;
    border: 1px solid #0f3460;
    border-radius: 0.375rem;
    color: #f0f0f0;
    transition: all 0.2s ease-in-out;
  }
  .input-field:focus {
    outline: none;
    border-color: #e94560;
    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.5);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);
