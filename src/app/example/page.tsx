import React from 'react';

const ExamplePage: React.FC = () => {
  return (
    <div>
      <header style={{ backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/shadows-of-gotham.firebasestorage.app/o/alimoini_Ultra-wide_comic-book_splash_header_on_a_rain-slick__039016ec-7d75-4c0a-8233-4e1ec46921c4_3.png?alt=media&token=0d9079bb-628f-4ac6-92b3-dbc6419fae47)', backgroundSize: 'cover', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>Welcome to the Example Page</h1>
      </header>
      <main>
        <h2>This is the content of the example page.</h2>
      </main>
    </div>
  );
};

export default ExamplePage;