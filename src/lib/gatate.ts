"use client";
import { hookstate, useHookstate } from "@hookstate/core";
import { useShallowEffect } from "@mantine/hooks";

const dirState = hookstate("");
const newFileLoadingState = hookstate(false);

const random = () => Math.random().toString(36).substring(2);

export const gState = {
  dirState,
  newFileLoadingState,
  random
};
