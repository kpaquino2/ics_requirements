import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ModalProps {
  isOpen: boolean;
  close: () => void;
  width: string;
  title?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, close, width, title, children }: ModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-40 bg-black/30" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel
              className={
                `flex flex-col overflow-hidden rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 ` +
                width
              }
            >
              <Dialog.Title className="text-2xl font-light">
                {title}
              </Dialog.Title>
              {children}
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
