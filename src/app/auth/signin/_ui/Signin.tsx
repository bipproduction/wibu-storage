"use client";
import { apies } from "@/lib/routes";
import { clientLogger } from "@/util/client-logger";
import { Button, Flex, Stack, Text, TextInput, Title } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";

type SigninForm = {
  email: string | null;
  password: string | null;
};
export function Signin() {
  const [form, setForm] = useState<SigninForm | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      if (!form || !form.email || !form.password) {
        alert("Please fill all the fields");
        clientLogger.error("Please fill all the fields");
        return;
      }

      setLoading(true);
      clientLogger.info("send signin", form);
      const response = await fetch(apies["/api/signin"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.text();
      if (response.ok) {
        const dataJson = JSON.parse(data);
        setForm(null);
        clientLogger.info("signin success", dataJson);
        return (window.location.href = dataJson.redirect);
      }
      alert("Error signing in");
      return;
    } catch (error) {
      clientLogger.error("Error sending logs:", error);
      return;
    } finally {
      setLoading(false);
    }
  }
  return (
    <Stack py={"xl"}>
      <Title>SIGNIN</Title>
      <TextInput
        placeholder="Your email"
        label="Email"
        defaultValue={form?.email as string}
        onChange={(e) => setForm({ ...form!, email: e.target.value })}
      />
      <TextInput
        placeholder="Your password"
        label="Password"
        defaultValue={form?.password as string}
        onChange={(e) => setForm({ ...form!, password: e.target.value })}
      />
      <Button loading={loading} onClick={onSubmit}>
        Submit
      </Button>
      <Flex>
        <Text>Dont have an account?</Text>
        <Button
          variant="transparent"
          size="compact-xs"
          component={Link}
          href="/auth/signup"
        >
          Signup
        </Button>
      </Flex>
      <Button
        variant="transparent"
        size="compact-xs"
        component={Link}
        href="/auth/forgot-password"
      >
        Forgot Password
      </Button>
    </Stack>
  );
}
