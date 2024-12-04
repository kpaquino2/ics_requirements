import { ReactNode, useState } from "react";

type TabProps = {
  tabs: Array<{ title: string; form: ReactNode | undefined }>;
};

const Tabs = ({ tabs }: TabProps) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div className="mt-4 flex gap-2">
        {tabs.map((t, i) => (
          <div
            key={i}
            className={
              (activeTab === i
                ? "rounded rounded-b-none border-2 border-b-0 border-zinc-200 dark:border-zinc-800"
                : "bg-zinc-300 hover:opacity-75 dark:bg-zinc-700") +
              " cursor-pointer rounded-t-md p-3 text-sm "
            }
            onClick={() => setActiveTab(i)}
          >
            {t.title}
          </div>
        ))}
      </div>
      <div className="mb-6 rounded border-2 border-zinc-200 p-8 dark:border-zinc-800">
        {tabs[activeTab].form}
      </div>
    </>
  );
};

export default Tabs;
