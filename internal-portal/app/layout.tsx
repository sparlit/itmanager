export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slate-800 text-white p-3">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <a href="/internal/dashboard" className="hover:underline">Dashboard</a>
            <a href="/internal/it-services" className="hover:underline">IT Services</a>
            <a href="/internal/tickets" className="hover:underline">Tickets</a>
            <a href="/internal/assets" className="hover:underline">Assets</a>
            <a href="/internal/users" className="hover:underline">Users</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
