import React, { useState } from 'react';

const ExamplePage: React.FC = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleShowPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <div>
      <h1>Example Page</h1>
      <button onClick={handleShowPreview}>Show Preview</button>

      {isPreviewOpen && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2>Preview</h2>
            <p>This is a preview of your content.</p>
            <button onClick={handleClosePreview}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const popupStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

export default ExamplePage;