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
          Cancel Order
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to cancel order{" "}
            <span className="font-mono font-semibold">
              #{order?.id.slice(-8).toUpperCase()}
            </span>
            ?
          </p>
          <p className="text-default-500 text-sm mt-2">
            This action cannot be undone. The items will be returned to stock.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Keep Order
          </Button>
          <Button color="danger" isLoading={isLoading} onPress={onConfirm}>
            Cancel Order
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
