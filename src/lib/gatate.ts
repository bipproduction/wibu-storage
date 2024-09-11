"use client";
import { hookstate, State, useHookstate } from "@hookstate/core";
import { useShallowEffect } from "@mantine/hooks";
import { useCallback } from "react";

// Utility function to generate a random string
const random = () => Math.random().toString(36).substring(2);

// States for directory, file loading, and loader
const dirState = hookstate("");
const newFileLoadingState = hookstate(false);
const dirLoaderState = hookstate(0);

const reloadWrappper = (state: State<number>, callBack: () => void) => {
  const s = useHookstate(state);

  useShallowEffect(() => {
    callBack();
  }, [s.value]);

  const reload = () => {
    s.set(Math.random());
  };
  return reload;
};

const useDirLoader = (callback: () => void) =>
  reloadWrappper(dirLoaderState, callback);

// Export global state
export const gState = {
  dirState,
  newFileLoadingState,
  random,
  useDirLoader
};
