import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Upload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    const fileInput = e.target.file.files[0];

    if (!fileInput) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput);

    setUploading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        onUpload();
        e.target.reset();
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response) {
        setError(`Upload failed: ${err.response.data.detail || err.response.statusText}`);
      } else {
        setError('Cannot connect to backend. Make sure FastAPI is running on port 8000.');
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Upload Excel/CSV</h3>
      <form onSubmit={handleUpload}>
        <input type="file" name="file" accept=".xls,.xlsx,.csv" disabled={uploading} />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}
