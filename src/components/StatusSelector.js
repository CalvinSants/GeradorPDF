import React from 'react';

const StatusSelector = ({ value, onChange }) => {
  const statuses = [
    { value: 'ok', label: '✅ OK', color: 'green' },
    { value: 'nok', label: '❌ Não OK', color: 'red' },
    { value: 'espera', label: '⏳ Espera', color: 'grey' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {statuses.map((status) => (
        <button
          key={status.value}
          type="button"
          onClick={() => onChange(status.value)}
          style={{
            padding: '8px 12px',
            border: `2px solid ${value === status.value ? status.color : '#ccc'}`,
            backgroundColor: value === status.value ? status.color : 'white',
            color: value === status.value ? 'white' : 'black',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: value === status.value ? 'bold' : 'normal',
          }}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

export default StatusSelector;