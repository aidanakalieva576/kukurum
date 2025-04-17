import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import React, { useState, useEffect, useRef } from "react";

const CheckoutForm = ({ onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const modalRef = useRef(null); // Ссылка на модальное окно


    const handleSubmit = async (e) => {
        
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });


        if (error) {
            alert(error.message);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                await fetch("http://localhost:8000/users_api/confirm-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        appointmentId: Number(localStorage.getItem("appointmentId")),
                      }),
                });

            } catch (err) {
                console.error("Ошибка при обновлении платежа", err);
            }

            onClose();
            setTimeout(() => window.location.reload(), 500);

        }

        setIsProcessing(false);
    };


    // Обработка клика вне модального окна
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && event.target === modalRef.current) {
                onClose();
                setTimeout(() => window.location.reload(), 500);

            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        // Очистка события при размонтировании компонента
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            ref={modalRef} // Обертка для модального окна
        >
            <div className="bg-white p-6 rounded-xl w-[400px] max-h-[80vh] overflow-y-auto shadow-lg">
                <form onSubmit={handleSubmit}>
                    <PaymentElement />
                    <button
                        disabled={isProcessing || !stripe || !elements}
                        className="mt-4 w-full bg-primary text-white py-2 px-4 rounded disabled:opacity-50"
                        type = "submit"
                    >
                        {isProcessing ? "Обработка..." : "Оплатить"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
