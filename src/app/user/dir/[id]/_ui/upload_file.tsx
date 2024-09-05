import { Token } from "@/lib/token";
import { Button, FileButton } from "@mantine/core";
import { useState } from "react";
import { MdFileUpload } from "react-icons/md";

export function UploadFile({ dirId }: { dirId: string }) {
    const [form, setForm] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);

    async function onClick(file: File | null) {
        if (!file) {
            return alert("No file selected");
        }

        const allowedMimeTypes = [
            "image/png",
            "image/jpeg",
            "image/gif",
            "text/csv",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
        ];

        // const file = form[0];

        if (!allowedMimeTypes.includes(file.type)) {
            return alert("Unsupported file type");
        }

        if (file.size > 100 * 1024 * 1024) { // 100 MB
            return alert("File size exceeds 100 MB");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("dirId", dirId);

        try {
            setLoading(true);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${Token.value}`,
                },
            });



            if (res.ok) {
                alert("File uploaded successfully");
            } else {
                const errorText = await res.text();
                alert(`Upload failed: ${errorText}`);
            }
        } catch (error) {
            alert("Error uploading file");
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <FileButton onChange={(e) => onClick(e)}>
            {(props) => <Button loading={loading} size="compact-xs" variant="outline" leftSection={<MdFileUpload />} {...props}>Upload</Button>}
        </FileButton>
    );
}