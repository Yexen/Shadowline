import React from 'react';
import './globals.css';

export const metadata = {
  title: 'My App',
  description: 'This is my app'
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2023 My App</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;