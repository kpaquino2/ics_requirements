import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  // this line is the key to avoid the error.
  if (!hasMounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full p-3 hover:bg-zinc-200 hover:dark:bg-zinc-800"
    >
      {theme === "light" ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ThemeChanger;
