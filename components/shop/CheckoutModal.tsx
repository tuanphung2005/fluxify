"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { CheckCircle } from "lucide-react";
import { api } from "@/lib/api/api";
import { toast } from "@/lib/toast";

interface CheckoutModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function CheckoutModal({ isOpen, onOpenChange }: CheckoutModalProps) {
    const { items, total, clearCart } = useCartStore();
    const [step, setStep] = useState<'details' | 'success'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    });

    const handlePayment = async () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!formData.street) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/api/orders", {
                email: formData.email,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country || "USA"
                }
            });

            setStep('success');
            clearCart();
        } catch (error: any) {
            console.error("Checkout failed:", error);
            // Display specific error message from backend if available
            toast.error(error.message || "Failed to process order. Some items may be out of stock.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset step after animation
        setTimeout(() => {
            setStep('details');
            setFormData({
                email: "",
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
            });
        }, 300);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
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
                                        <Input
                                            label="Email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onValueChange={(v) => handleChange('email', v)}
                                            isRequired
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                label="Street Address"
                                                placeholder="123 Main St"
                                                value={formData.street}
                                                onValueChange={(v) => handleChange('street', v)}
                                                isRequired
                                            />
                                            <Input
                                                label="City"
                                                placeholder="New York"
                                                value={formData.city}
                                                onValueChange={(v) => handleChange('city', v)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                label="State"
                                                placeholder="NY"
                                                value={formData.state}
                                                onValueChange={(v) => handleChange('state', v)}
                                            />
                                            <Input
                                                label="Zip Code"
                                                placeholder="10001"
                                                value={formData.zipCode}
                                                onValueChange={(v) => handleChange('zipCode', v)}
                                            />
                                            <Input
                                                label="Country"
                                                placeholder="USA"
                                                value={formData.country}
                                                onValueChange={(v) => handleChange('country', v)}
                                            />
                                        </div>

                                        <div className="border-t border-divider my-4 pt-4">
                                            <p className="text-sm font-semibold mb-2">Payment Details (Mock)</p>
                                            <Input label="Card Number" placeholder="4242 4242 4242 4242" />
                                            <div className="flex gap-2 mt-2">
                                                <Input label="Expiry" placeholder="MM/YY" />
                                                <Input label="CVC" placeholder="123" />
                                            </div>
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
