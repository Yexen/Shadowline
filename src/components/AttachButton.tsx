import React from 'react';

const AttachButton: React.FC = () => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // TODO: Implement file handling logic here
    }
  };

  return (
    <div>
      <input
        type="file"
        id="attach-button"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="attach-button" style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '5px' }}>
        Attach File
      </label>
    </div>
  );
};

export default AttachButton;
