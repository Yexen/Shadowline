import React from 'react';

const ExamplePage: React.FC = () => {
  return (
    <div>
      <header style={{ backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/shadows-of-gotham.firebasestorage.app/o/alimoini_Ultra-wide_comic-book_splash_header_on_a_rain-slick__039016ec-7d75-4c0a-8233-4e1ec46921c4_3.png?alt=media&token=0d9079bb-628f-4ac6-92b3-dbc6419fae47)', backgroundSize: 'cover', height: '300px' }}>
        <h1 style={{ color: 'white', textAlign: 'center', padding: '100px 0' }}>Welcome to the Example Page</h1>
      </header>
      <main>
        <p>This is an example page using Next.js and TypeScript.</p>
      </main>
    </div>
  );
};

export default ExamplePage;