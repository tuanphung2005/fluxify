"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { CheckCircle } from "lucide-react";

interface CheckoutModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function CheckoutModal({ isOpen, onOpenChange }: CheckoutModalProps) {
    const { total, clearCart } = useCartStore();
    const [step, setStep] = useState<'details' | 'success'>('details');
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep('success');
        clearCart();
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset step after animation
        setTimeout(() => setStep('details'), 300);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {step === 'details' ? 'Checkout' : 'Order Confirmed'}
                        </ModalHeader>
                        <ModalBody>
                            {step === 'details' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-default-50 rounded-lg">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Amount</span>
                                            <span>${total().toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Input label="Email" placeholder="john@example.com" />
                                        <Input label="Card Number" placeholder="4242 4242 4242 4242" />
                                        <div className="flex gap-2">
                                            <Input label="Expiry" placeholder="MM/YY" />
                                            <Input label="CVC" placeholder="123" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                    <CheckCircle className="w-16 h-16 text-success" />
                                    <div>
                                        <h3 className="text-xl font-bold">Thank you for your order!</h3>
                                        <p className="text-default-500">A confirmation email has been sent.</p>
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {step === 'details' ? (
                                <>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={handlePayment} isLoading={isLoading}>
                                        Pay ${total().toFixed(2)}
                                    </Button>
                                </>
                            ) : (
                                <Button color="primary" onPress={handleClose}>
                                    Close
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
