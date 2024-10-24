"use client";
import { apies } from "@/lib/routes";
import { ntf } from "@/state/use_notification";
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
      if (!form || !form.email || !form.password)
        return ntf.set({
          type: "error",
          msg: "Please fill all the fields",
          autoClose: false
        });
      setLoading(true);
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
        return (window.location.href = dataJson.redirect);
      }
      return ntf.set({ type: "error", msg: data });
    } catch (error) {
      console.log(error);
      return ntf.set({ type: "error", msg: "Something went wrong" });
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
      <Button variant="transparent" size="compact-xs" component={Link} href="/auth/forgot-password">
        Forgot Password
      </Button>
    </Stack>
  );
}
