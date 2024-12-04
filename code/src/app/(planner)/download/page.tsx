"use client";

import Document from "@/components/download/Document";
import Tabs from "@/components/download/Tabs";

export default function Generate() {
  const formats = [{ title: "Document", form: <Document /> }];

  return (
    <div className="mt-5 flex w-full justify-center">
      <div className="flex w-[700px] flex-col">
        <div className="text-3xl font-light">Download</div>
        <Tabs tabs={formats} />
      </div>
    </div>
  );
}
