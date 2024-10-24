"use client";

import { apies } from "@/lib/routes";
import { ntf } from "@/state/use_notification";
import {
  Button,
  Group,
  NumberInput,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { useState } from "react";
import { MdEmail } from "react-icons/md";

export default function Page() {
  const [form, setForm] = useState({
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  async function onSubmit() {
    setLoading(true);
    try {
      if (!form.phone && !form.email)
        return ntf.set({ type: "error", msg: "Please fill all the fields" });

      const response = await fetch(apies["/api/forgot-password"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          phone: "62" + form.phone
        })
      });

      const data = await response.text();
      if (response.status !== 200) {
        return ntf.set({ type: "error", msg: data });
      }
      ntf.set({ type: "success", msg: data });
      setForm({ phone: "", email: "" });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Stack>
      <Group>
        <Stack>
          <Title>Forgot Password</Title>
          <TextInput
            leftSection={<MdEmail />}
            placeholder="Your email"
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <NumberInput
            leftSection="+62"
            value={form.phone}
            label="Phone"
            placeholder="Your phone number"
            onChange={(e) => setForm({ ...form, phone: e + "" })}
          />
          <Button loading={loading} onClick={onSubmit}>
            Submit
          </Button>
        </Stack>
      </Group>
    </Stack>
  );
}
