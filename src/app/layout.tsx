// Layout component
import React from 'react';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{ backgroundImage: 'url(/header-cover.jpg)', height: '300px', backgroundSize: 'cover' }}>
          {/* TODO: Add header content here */}
        </header>
        {children}
      </body>
    </html>
  );
}
