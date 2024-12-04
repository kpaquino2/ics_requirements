import { useState, type Dispatch, type SetStateAction } from "react";
import Modal from "./Modal";
import {
  useSignInWithGithub,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import Button from "../Button";

interface SignInModalProps {
  openSignInModal: boolean;
  setOpenSignInModal: Dispatch<SetStateAction<boolean>>;
}

const SignInModal = ({
  openSignInModal,
  setOpenSignInModal,
}: SignInModalProps) => {
  const [signInWithGoogle, googleUser, googleLoading, googleError] =
    useSignInWithGoogle(auth);
  const [signInWithGithub, githubUser, githubLoading, githubError] =
    useSignInWithGithub(auth);

  const [error, setError] = useState("");

  return (
    <Modal
      isOpen={openSignInModal}
      close={() => {
        setOpenSignInModal(false);
        setError("");
      }}
      width="w-96"
      title="Sign In"
    >
      <div className="m-4 flex flex-col gap-4">
        <button
          type="button"
          className="flex h-10 items-center rounded bg-zinc-50 px-3 text-zinc-900 shadow"
          onClick={async () =>
            await signInWithGoogle().then((v) => {
              setError(googleError?.message || "");
              return setOpenSignInModal(!v);
            })
          }
          disabled={googleLoading || githubLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 48 48"
            width={24}
          >
            <defs>
              <path
                id="a"
                d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              />
            </defs>
            <clipPath id="b">
              <use xlinkHref="#a" overflow="visible" />
            </clipPath>
            <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
            <path
              clipPath="url(#b)"
              fill="#EA4335"
              d="M0 11l17 13 7-6.1L48 14V0H0z"
            />
            <path
              clipPath="url(#b)"
              fill="#34A853"
              d="M0 37l30-23 7.9 1L48 0v48H0z"
            />
            <path
              clipPath="url(#b)"
              fill="#4285F4"
              d="M48 48L17 24l-4-3 35-10z"
            />
          </svg>
          <span className="mx-auto">Continue with Google</span>
        </button>
        <button
          type="button"
          className="flex h-10 items-center rounded bg-[#f5f5f5] px-3 text-[#24292f] shadow dark:bg-[#24292f] dark:text-[#f5f5f5]"
          onClick={async () =>
            await signInWithGithub().then((v) => {
              setError(githubError?.message || "");
              return setOpenSignInModal(!v);
            })
          }
          disabled={googleLoading || githubLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width={24}
            className="fill-[#24292f] dark:fill-white"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
          <span className="mx-auto">Continue with GitHub</span>
        </button>
      </div>
      <div className="mx-4 text-xs text-rose-600 dark:text-rose-400">
        {error}
      </div>
      <div className="mt-1 flex justify-center gap-3">
        <Button
          type="button"
          onClick={() => {
            setOpenSignInModal(false);
            setError("");
          }}
          variant="primary"
          size="md"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default SignInModal;
