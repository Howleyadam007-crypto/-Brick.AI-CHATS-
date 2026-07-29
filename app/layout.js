export const metadata = {
  title: "Brick.AI.chats",
  description: "A general AI assistant chat app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
  }
