// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { CustonNotification } from '@/state/use_notification';


export const metadata = {
  title: 'Wibu Storage',
  description: 'storage for wibu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme='dark' />
      </head>
      <body>
        <MantineProvider defaultColorScheme='dark'>
          <CustonNotification />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}