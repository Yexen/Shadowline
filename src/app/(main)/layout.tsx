export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Shadowline</h1>
      {children}
    </div>
  );
}