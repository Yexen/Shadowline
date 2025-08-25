import React from 'react';
import { Inter } from 'next/font/google';
import styles from './page.module.css';

const inter = Inter({ subsets: ['latin'] });

const ExamplePage: React.FC = () => {
  return (
    <main className={`${styles.main} ${inter.className}`}>
      <h1 className={styles.title}>Welcome to the Example Page</h1>
      <p className={styles.description}>
        This page demonstrates the application of the App's aesthetics.
      </p>
      <div className={styles.grid}>
        <a href="#" className={styles.card}>
          <h2>Card 1 &rarr;</h2>
          <p>Learn more about this topic.</p>
        </a>
        <a href="#" className={styles.card}>
          <h2>Card 2 &rarr;</h2>
          <p>Discover new features.</p>
        </a>
        <a href="#" className={styles.card}>
          <h2>Card 3 &rarr;</h2>
          <p>Get started with our services.</p>
        </a>
        <a href="#" className={styles.card}>
          <h2>Card 4 &rarr;</h2>
          <p>Join our community.</p>
        </a>
      </div>
    </main>
  );
};

export default ExamplePage;