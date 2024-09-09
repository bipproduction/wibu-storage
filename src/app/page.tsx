"use client";
import {
  BackgroundImage,
  Button,
  Center,
  Flex,
  Stack,
  Text,
  Title
} from "@mantine/core";
import Link from "next/link";

export default function Home() {
  return (
    <BackgroundImage src={"/assets/img/bg.png"} h={"100vh"}>
      <Stack
        p={"md"}
        style={{
          backdropFilter: "blur(8px)"
        }}
      >
        <Flex justify={"end"}>
          <Button variant="outline" size="xs" component={Link} href="/user">
            Go to User Page{" "}
          </Button>
        </Flex>
        <Center>
          <Title c={"white"}>Wibu Storage</Title>
        </Center>
      </Stack>
      <Stack
        gap={0}
        p={"md"}
        w={"100%"}
        style={{
          backdropFilter: "blur(8px)"
        }}
        pos={"absolute"}
        bottom={0}
      >
        <Text>wibu@2024</Text>
        <Text>v1.0.0</Text>
      </Stack>
    </BackgroundImage>
  );
}
