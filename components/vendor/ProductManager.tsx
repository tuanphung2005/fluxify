"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";
import ProductManagerContent from "./ProductManagerContent";

interface ProductManagerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onProductsChange: () => void;
}

export default function ProductManager({
    isOpen,
    onOpenChange,
    onProductsChange,
}: ProductManagerProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Manage Products</ModalHeader>
                        <ModalBody>
                            <ProductManagerContent onProductsChange={onProductsChange} />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
