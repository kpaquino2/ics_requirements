import type { Dispatch, SetStateAction } from "react";
import Button from "../Button";
import Modal from "./Modal";

type onConfirmType = {
  title: string;
  message: string;
  action: () => void;
};

interface ConfirmActionModalProps {
  onConfirm: null | onConfirmType;
  setOnConfirm: Dispatch<SetStateAction<null | onConfirmType>>;
}

const ConfirmActionModal = ({
  onConfirm,
  setOnConfirm,
}: ConfirmActionModalProps) => {
  return (
    <Modal
      isOpen={!!onConfirm}
      close={() => setOnConfirm(null)}
      width="w-96"
      title={onConfirm?.title}
    >
      <div className="py-2">{onConfirm?.message}</div>
      <div className="mt-2 flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => setOnConfirm(null)}
          variant="base"
          size="md"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!onConfirm) return;
            onConfirm.action();
            setOnConfirm(null);
          }}
          variant="primary"
          size="md"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmActionModal;
