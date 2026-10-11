/** @format */
import type { ReactNode } from "react";

// عنوان كل صفحة في لوحة التحكم، مع أزرارها يمينًا
const PageHeader = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children?: ReactNode;
}) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
    <div>
      <h1 className="text-3xl font-medium tracking-[-0.04em]">{title}</h1>
      {note && <p className="mt-2 max-w-2xl text-sm text-black/60">{note}</p>}
    </div>
    {children && <div className="flex flex-wrap gap-2">{children}</div>}
  </header>
);

export default PageHeader;
