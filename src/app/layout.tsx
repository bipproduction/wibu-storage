import "@mantine/core/styles.css";
// import { CustonNotification } from "@/state/use_notification";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";


export const metadata = {
  title: "Wibu Storage",
  description: "storage for wibu"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
