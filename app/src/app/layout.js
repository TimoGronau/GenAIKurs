import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import NavLinks from "@/components/NavLinks";

export const metadata = {
  title: "Kochbuch",
  description: "Rezepte und Vorrat verwalten und sehen, was man heute kochen kann.",
};

// Übernimmt das Hell/Dunkel-Schema des Systems, bevor die Seite gezeichnet wird.
const themeScript = `
  (function () {
    var m = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() { document.documentElement.setAttribute("data-bs-theme", m.matches ? "dark" : "light"); }
    apply();
    m.addEventListener("change", apply);
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="border-bottom bg-body sticky-top">
          <nav className="container d-flex flex-wrap align-items-center gap-3 py-2">
            <span className="fs-5 fw-semibold me-2">Kochbuch</span>
            <NavLinks />
          </nav>
        </header>
        <main className="container py-4" style={{ maxWidth: 760 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
