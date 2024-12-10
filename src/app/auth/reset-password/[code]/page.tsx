"use client";
import { apies } from "@/lib/routes";
import { clientLogger } from "@/util/client-logger";
import { Button, PasswordInput, Stack, Title } from "@mantine/core";
import { useState } from "react";

export default function Page({ params }: { params: { code: string } }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  async function onSubmit() {

    setLoading(true);
    try {
      if (!form.password) {
        alert("Please fill all the fields");
        clientLogger.error("Please fill all the fields");
        return;
      }

      if (form.password !== form.confirmPassword) {
        alert("Password and confirm password must be same");
        clientLogger.error("Password and confirm password must be same");
        return;
      }

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
        clientLogger.error("reset password failed", data);
        return;
      }
      clientLogger.info("reset password success");
      setForm({ password: "", confirmPassword: "" });
      const dataJson = JSON.parse(data);
      window.location.href = dataJson.redirect;
    } catch (error) {
      clientLogger.error("Error sending logs:", error);
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
