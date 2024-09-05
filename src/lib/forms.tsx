
  import { useShallowEffect } from "@mantine/hooks";
  import { Stack, TextInput } from "@mantine/core";
  import { useState } from "react";
  type User = "id" | "name" | "email" | "password" | "active" | "createdAt" | "updatedAt" | "UserCookies" | "Project" | "ApiKey" | "ProjectDir" | "File"
export function FormUser({listItem, onchange}: {listItem: User[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }
type ApiKey = "id" | "name" | "desc" | "active" | "createdAt" | "updatedAt" | "User" | "userId"
export function FormApiKey({listItem, onchange}: {listItem: ApiKey[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }
type UserCookies = "id" | "User" | "active" | "cookie" | "createdAt" | "updatedAt" | "userId"
export function FormUserCookies({listItem, onchange}: {listItem: UserCookies[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }
type Project = "id" | "name" | "desc" | "active" | "createdAt" | "updatedAt" | "User" | "userId" | "ProjectDir" | "File"
export function FormProject({listItem, onchange}: {listItem: Project[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }
type Dir = "id" | "name" | "active" | "createdAt" | "updatedAt" | "Project" | "User" | "projectId" | "userId" | "File" | "ParentDir" | "ChildDir" | "projectDirId"
export function FormDir({listItem, onchange}: {listItem: Dir[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }
type Files = "id" | "name" | "path" | "type" | "ext" | "desc" | "size" | "active" | "createdAt" | "updatedAt" | "User" | "userId" | "Project" | "projectId" | "storageId" | "ProjectDir" | "projectDirId"
export function FormFiles({listItem, onchange}: {listItem: Files[], onchange: (val: any) => void }) {
      const [form, setForm] = useState<Record<string, string>>({});
      useShallowEffect(() => {
        form && onchange(form);
      }, [form]);
      return (
        <Stack gap={0}>
          {listItem.map((item, k) => (
            <Stack key={k}>
              <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
            </Stack>
          ))}
        </Stack>
      );
    }