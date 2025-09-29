import React from 'react';

export default function DataPreview({ preview }) {
  if (!preview) return null;
  const cols = preview.columns || (preview.rows?.length ? Object.keys(preview.rows[0]) : []);
  const rows = preview.rows || [];

  return (
    <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ border: '1px solid #eee', padding: 6, textAlign: 'left' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((r, idx) => (
            <tr key={idx}>
              {cols.map((c) => (
                <td key={c} style={{ border: '1px solid #eee', padding: 6 }}>
                  {String(r[c] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
