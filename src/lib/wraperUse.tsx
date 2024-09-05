"use client";

import { State, useHookstate } from "@hookstate/core";
import { useShallowEffect } from "@mantine/hooks";
import { useState } from "react";
import { Token } from "./token";

export function wraperUseGlobal<S, Where>(
  state: State<S>,
  url: string,
  { where }: { where?: Where } = {}
) {
  // console.log(token);
  return function useWraper() {
    const [loading, setLoading] = useState(false);
    const wraperState = useHookstate(state);
    const [reloadCount, setReloadCount] = useState(0);
    const option_where = where ? { where: where } : {};
    const options = {
      headers: {
        Authorization: `Bearer ${Token.value}`,
        "x-where": JSON.stringify(option_where),
      },
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          cache: "no-cache",
          ...options,
        });
        setLoading(false);
        if (response.ok) {
          const data = await response.json();
          wraperState.set(data);
        } else {
          console.error(`Failed to load data: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    const triggerReload = () => setReloadCount((prev) => prev + 1);

    useShallowEffect(() => {
      !wraperState.value && loadData();
      if (wraperState.value && reloadCount > 0) {
        loadData();
      }
    }, [reloadCount, wraperState.value]);

    return {
      value: wraperState.value,
      set: wraperState.set,
      reload: triggerReload,
      loading,
    } as const;
  };
}

export function useWraperUseLocal<W, V>(url: string, { where }: { where?: W } = {}) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<V | null>(null)
  const [reloadCount, setReloadCount] = useState(0);
  const option_where = where ? { where: where } : {};
  const options = {
    headers: {
      Authorization: `Bearer ${Token.value}`,
      "x-where": JSON.stringify(option_where),
    },
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        cache: "no-cache",
        ...options,
      });
      setLoading(false);
      if (response.ok) {
        const data = await response.json();
        setValue(data);
      } else {
        console.error(`Failed to load data: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const reload = () => {
    loadData();
  };

  useShallowEffect(() => {
    !value && loadData();
    // if (value && reloadCount > 0) {
    //   loadData();
    // }
  }, [value]);


  return {
    value,
    setValue,
    reload,
    loading
  }
}
