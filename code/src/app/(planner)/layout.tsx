"use client";

import {
  FileText,
  Gear,
  GraduationCap,
  SignIn,
  SignOut,
  User,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { usePathname } from "next/navigation";
import ThemeChanger from "@/components/ui/ThemeChanger";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { useState } from "react";
import SignInModal from "@/components/ui/modals/SignInModal";
import { usePlanStore } from "@/lib/store/planStore";
import { useConstantsStore } from "@/lib/store/constStore";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [signOut] = useSignOut(auth);
  const [openSignInModal, setOpenSignInModal] = useState(false);
  const deletePlan = usePlanStore((state) => state.deletePlan);
  const resetConstants = useConstantsStore((state) => state.resetConstants);

  const sidebarItems = [
    { url: "/", icon: <GraduationCap size={32} /> },
    { url: "/download", icon: <FileText size={32} /> },
    {
      url: "/settings",
      icon: <Gear size={32} />,
    },
  ];
  return (
    <div>
      <SignInModal
        openSignInModal={openSignInModal}
        setOpenSignInModal={setOpenSignInModal}
      />
      <div className="flex h-screen flex-col">
        <div className="min-h-[4rem] border-b-2 border-zinc-200 dark:border-zinc-800">
          <div className="flex h-full items-center justify-between gap-2 px-4">
            <span className="text-2xl font-light">UPLB Degree Planner</span>
            <div className="flex gap-2">
              <ThemeChanger />
              {user ? (
                <Button
                  variant="base"
                  size="lg"
                  onClick={() =>
                    signOut().then((v) => {
                      if (v) {
                        deletePlan();
                        resetConstants();
                      }
                    })
                  }
                >
                  <SignOut size={24} />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="base"
                  size="lg"
                  onClick={() => setOpenSignInModal(true)}
                >
                  <SignIn size={24} />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex h-full overflow-hidden">
          <div className="z-20 flex h-full w-16 flex-col justify-between border-r-2 border-zinc-200 dark:border-zinc-800">
            <div className="flex grow flex-col">
              {sidebarItems.map((item, index) => (
                <Button
                  href={item.url}
                  key={index}
                  active={item.url === pathname}
                  variant="base"
                  size="xl"
                  fill
                >
                  {item.icon}
                </Button>
              ))}
            </div>
          </div>
          <main className="flex w-full flex-1 flex-col overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
