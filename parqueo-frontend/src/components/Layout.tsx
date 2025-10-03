import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="navbar">
        <div className="container">
          <Navbar />
        </div>
      </div>
      <main className="container">{children}</main>
    </div>
  );
}
