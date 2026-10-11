/** @format */
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { errorText } from "./ui";

// تحميل بيانات من الخادم داخل صفحة في لوحة التحكم:
//   const { data, error, reload, setData } = useLoad<{ books: AdminBook[] }>("/api/admin/books")
export const useLoad = <T>(path: string) => {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    api<T>(path)
      .then((data) => alive && setState({ data }))
      .catch((err) => alive && setState({ error: errorText(err) }));
    return () => {
      alive = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback((data: T) => setState({ data }), []);
  return { ...state, reload, setData };
};
