import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataPreview from './DataPreview.jsx';
import ChartRenderer from './ChartRenderer.jsx';
const API_URL = import.meta.env.VITE_API_URL;

export default function Chat({ upload }) {
  const [sheet, setSheet] = useState(upload.sheets?.[0] || null);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setSheet(upload.sheets?.[0] || null);
    fetchPreview();
    setMessages([]);
  }, [upload]);

  async function fetchPreview() {
    try {
      const res = await axios.post(`${API_URL}/preview/${upload.id}`, null, {
        params: { sheet },
      })
      setPreview(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function ask(e) {
    e.preventDefault();
    if (!question) return;
    const payload = { upload_id: upload.id, sheet, question };
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setQuestion('');
    try {
        const res = await axios.post(`${API_URL}/query`, payload);
      const data = res.data;
      let text = data.answer || JSON.stringify(data);
      setMessages((prev) => [...prev, { role: 'assistant', text, raw: data }]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h3>{upload.filename}</h3>
      <div style={{ marginBottom: 8 }}>
        <label>Sheet: </label>
        <select value={sheet || ''} onChange={(e) => setSheet(e.target.value)}>
          {upload.sheets?.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={fetchPreview} style={{ marginLeft: 8 }}>
          Preview
        </button>
      </div>

      {preview && <DataPreview preview={preview} />}

      <form onSubmit={ask} style={{ marginTop: 12 }}>
        <input
          value={question}
          placeholder={`Ask something about ${upload.filename}`}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '70%' }}
        />
        <button type="submit">Ask</button>
      </form>

      <div style={{ marginTop: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: m.role === 'user' ? 600 : 400 }}>{m.role}</div>
            <div>{m.text}</div>
            {m.raw?.table && (
              <div style={{ marginTop: 8 }}>
                <h4>Table</h4>
                <DataPreview preview={{ columns: Object.keys(m.raw.table[0] || {}), rows: m.raw.table }} />
              </div>
            )}
            {m.raw?.chart && (
              <div style={{ marginTop: 8 }}>
                <h4>Chart</h4>
                <ChartRenderer chart={m.raw.chart} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
