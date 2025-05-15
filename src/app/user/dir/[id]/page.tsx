import { Title } from "@mantine/core";
import DirPage from "./_ui/DirPage";

export default function Page({ params }: { params: { id: string } }) {
    return <div>
        <DirPage params={params} />
    </div>
}