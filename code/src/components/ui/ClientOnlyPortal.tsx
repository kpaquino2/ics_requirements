import { useRef, type ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ClientOnlyPortalProps {
  children: ReactNode;
  selector: string;
}

const ClientOnlyPortal = ({ children, selector }: ClientOnlyPortalProps) => {
  const ref = useRef<Element>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector)!;
    setMounted(true);
  }, [selector]);
  return mounted ? createPortal(children, ref.current!) : null;
};

export default ClientOnlyPortal;
