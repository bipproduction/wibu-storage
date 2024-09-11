"use client";
import { hookstate, State, useHookstate } from "@hookstate/core";
import { useShallowEffect } from "@mantine/hooks";
import { useCallback } from "react";

// Utility function to generate a random string
// const rdm = Math.random();

// States for directory, file loading, and loader
// const dirState = hookstate("");
const newFileLoadingState = hookstate(false);
// const dirLoaderState = hookstate(0);

// const useReloadWrappper = (state: State<number>, callBack: () => void) => {
//   useShallowEffect(() => {
//     callBack();
//   }, [state.value]);

//   const reload = () => {
//     state.set(Math.random());
//   };
//   return reload;
// };

// const useDirLoader = (callback: () => void) =>
//   useReloadWrappper(useHookstate(dirLoaderState), callback);

// Export global state

const reloadDirState = hookstate(0);
export const gState = {
  // dirState,
  newFileLoadingState,
  reloadDirState
  // useDirLoader
};
