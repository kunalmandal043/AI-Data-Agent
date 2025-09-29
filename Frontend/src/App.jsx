import React, { useState, useEffect } from 'react';
import Upload from './components/Upload.jsx';
import Chat from './components/Chat.jsx';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;


export default function App() {
  const [uploads, setUploads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  async function fetchUploads() {
    try {
        const res = await axios.get(`${API_URL}/uploads`);

      setUploads(res.data || []);
      if (res.data?.length > 0 && !selected) setSelected(res.data[0]);
    } catch (err) {
      console.error('Error fetching uploads:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid #ddd', paddingRight: 16 }}>
        <h2 style={{ marginBottom: 20 }}>AI Data Agent</h2>
        <Upload onUpload={fetchUploads} />

        <h3>Uploads</h3>
        {uploads.length === 0 ? (
          <div style={{ color: '#888', marginTop: 10 }}>No uploads found</div>
        ) : (
          uploads.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelected(u)}
              style={{
                padding: 10,
                cursor: 'pointer',
                borderRadius: 6,
                marginBottom: 8,
                background: selected?.id === u.id ? '#eef' : '#fff',
                border: '1px solid #ddd',
              }}
            >
              <strong>{u.filename}</strong>
              <div style={{ fontSize: 12, color: '#555' }}>{u.sheets?.join(', ')}</div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1 }}>
        {selected ? (
          <Chat upload={selected} />
        ) : (
          <div style={{ color: '#888', padding: 20 }}>Select or upload a file to start chatting</div>
        )}
      </div>
    </div>
  );
}
