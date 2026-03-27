"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type SeciliVaryantId = string | null;

interface ModelSecimCtx {
  secili: SeciliVaryantId;
  sec: (id: SeciliVaryantId) => void;
}

const ModelSecimContext = createContext<ModelSecimCtx>({
  secili: null,
  sec: () => {},
});

export function ModelSecimProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [secili, setSecili] = useState<SeciliVaryantId>(null);

  useEffect(() => {
    const saved = localStorage.getItem("togg-aracim");
    if (saved) setSecili(saved);
  }, []);

  function sec(id: SeciliVaryantId) {
    setSecili(id);
    if (id) localStorage.setItem("togg-aracim", id);
    else localStorage.removeItem("togg-aracim");
  }

  return (
    <ModelSecimContext.Provider value={{ secili, sec }}>
      {children}
    </ModelSecimContext.Provider>
  );
}

export function useModelSecim() {
  return useContext(ModelSecimContext);
}
