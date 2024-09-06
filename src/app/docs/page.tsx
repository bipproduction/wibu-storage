import { Stack } from '@mantine/core'
import path from 'path'
import fs from 'fs'
import DocsPage from './_ui/DocsPage';
const root = path.join(process.cwd(), "public/assets/docs");
const filePath = path.join(root, "DOCS.md");
const docsContent = fs.readFileSync(filePath, "utf-8");
export default function Page() {
    return <Stack>
        <DocsPage content={docsContent} />
    </Stack>
}
