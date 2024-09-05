'use client'
import { pages } from "@/lib/routes";
import { ActionIcon, Button, Flex } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { MdArrowRight, MdHome } from 'react-icons/md';

export function useBrd() {
  const [value, set] = useLocalStorage<{ id: string; title: string }[]>({
    key: "brd",
    defaultValue: [],
  });

  function setValue(data: any[]) {
    console.log(JSON.stringify(data))
    return set(data)
  }

  function updateValue({ id, title }: { id: string; title: string }) {
    const index = value.findIndex((v) => v.id === id);
    if (index === -1) {
      return set([...value, { id, title }]);
    }
  }

  function onClick(data: any) {
    const index = value.findIndex(v => v.id === data.id)
    if (index !== -1) {
      value.splice(index + 1)
      return set([...value])
    }
  }

  function clear() {
    return set([])
  }

  return {
    value,
    setValue,
    updateValue,
    onClick,
    clear
  }
}

export function BrdProvider() {
  const { value, onClick, clear } = useBrd()
  return <Flex align={"center"}>
    <ActionIcon component={Link} href={pages["/user/dir/[id]"]({ id: "root" })} onClick={clear} variant="subtle" size={"lg"}>
      <MdHome />
    </ActionIcon>
    {value.map((brd, k) => <Flex gap={"0"} key={k} align={"center"}>
      <Link style={{
        color: "white",
        textDecoration: "none"
      }} href={pages["/user/dir/[id]"]({ id: brd.id })} onClick={() => onClick(brd)}>{brd.title}</Link>
      <MdArrowRight />
    </Flex>)}
  </Flex>
}
