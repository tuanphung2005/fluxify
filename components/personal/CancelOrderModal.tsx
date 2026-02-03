"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertTriangle } from "lucide-react";

import { Order } from "./types";

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelOrderModal({
  isOpen,
  order,
  isLoading,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <AlertTriangle className="text-warning" size={24} />
          Hủy đơn
        </ModalHeader>
        <ModalBody>
          <p>
            Bạn có chắc chắn muốn hủy đơn hàng{" "}
            <span className="font-mono font-semibold">
              #{order?.id.slice(-8).toUpperCase()}
            </span>
            ?
          </p>
          <p className="text-default-500 text-sm mt-2">
            Hành động này không thể hoàn tác. Các mặt hàng sẽ được trả lại kho.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Giữ đơn
          </Button>
          <Button color="danger" isLoading={isLoading} onPress={onConfirm}>
            Hủy đơn
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
