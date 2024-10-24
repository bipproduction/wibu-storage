"use client";
import { apies } from "@/lib/routes";
import { ntf } from "@/state/use_notification";
import { Button, PasswordInput, Stack, Title } from "@mantine/core";
import { useState } from "react";

export default function Page({ params }: { params: { code: string } }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  async function onSubmit() {
    setLoading(true);
    try {
      if (!form.password)
        return ntf.set({ type: "error", msg: "Please fill all the fields" });
      if (form.password !== form.confirmPassword)
        return ntf.set({ type: "error", msg: "Password does not match" });
      const response = await fetch(apies["/api/reset-password"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: params.code,
          password: form.password
        })
      });
      const data = await response.text();
      if (response.status !== 200) {
        return ntf.set({ type: "error", msg: data });
      }
      ntf.set({ type: "success", msg: data });
      setForm({ password: "", confirmPassword: "" });
      const dataJson = JSON.parse(data);
      window.location.href = dataJson.redirect;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Stack>
      <Title>RESET PASSWORD</Title>
      <PasswordInput
        defaultValue={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Your password"
        label="Password"
      />
      <PasswordInput
        defaultValue={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        placeholder="Confirm your password"
        label="Confirm Password"
      />
      <Button onClick={onSubmit} loading={loading}>
        Submit
      </Button>
    </Stack>
  );
}
