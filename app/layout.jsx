import "./globals.css";

export const metadata = {
  title: "Satta Matka Results",
  description: "Latest Satta Matka results, charts and updates.",
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
