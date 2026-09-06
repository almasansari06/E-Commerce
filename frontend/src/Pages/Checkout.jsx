import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Checkout.css';
import { apiUrl } from '../utils/api';

export default function Checkout() {
    const { getDiscountedSelectedCartAmount, getSelectedCartItems, all_product, cartItems, selectedCartItems, getCartSize, setCartItems, setCartSizes, setSelectedCartItems, setAppliedCoupon } = useContext(ShopContext);
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
    });

    React.useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;
        fetch(apiUrl('/profile'), { headers: { 'auth-token': token } })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) setFormData((current) => ({ ...current, ...data.profile }));
            })
            .catch(() => {});
    }, []);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const openRazorpay = (paymentOrder, keyId, orderData, token) => new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            reject(new Error('Razorpay checkout could not load.'));
            return;
        }
        const checkout = new window.Razorpay({
            key: keyId,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: 'Shopper',
            description: 'Shopper order payment',
            order_id: paymentOrder.id,
            prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
            handler: async (response) => {
                try {
                    const verification = await fetch(apiUrl('/payment/verify'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'auth-token': token },
                        body: JSON.stringify({ ...response, orderData }),
                    });
                    const data = await verification.json();
                    if (!verification.ok || !data.success) throw new Error(data.message || 'Payment verification failed.');
                    resolve(data);
                } catch (verificationError) {
                    reject(verificationError);
                }
            },
            modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
        });
        checkout.open();
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        const items = Object.entries(cartItems)
            .filter(([productId, quantity]) => quantity > 0 && selectedCartItems[productId])
            .map(([productId, quantity]) => {
                const product = all_product.find((item) => item.id === Number(productId));
                return product ? { ...product, size: getCartSize(product.id), quantity } : null;
            })
            .filter(Boolean);

        setIsSubmitting(true);
        setError('');
        try {
            const orderData = {
                items,
                amount: getDiscountedSelectedCartAmount(),
                address: formData,
                paymentMethod,
            };
            if (paymentMethod === 'online') {
                const paymentResponse = await fetch(apiUrl('/payment/create-order'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'auth-token': token },
                    body: JSON.stringify({ amount: orderData.amount }),
                });
                const paymentData = await paymentResponse.json();
                if (!paymentResponse.ok || !paymentData.success) throw new Error(paymentData.message || 'Unable to start online payment.');
                await openRazorpay(paymentData.order, paymentData.keyId, orderData, token);
            } else {
                const response = await fetch(apiUrl('/orders'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify(orderData),
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || 'Unable to place order.');
            }
            setCartItems((current) => Object.keys(current).reduce((nextCart, itemId) => ({ ...nextCart, [itemId]: selectedCartItems[itemId] ? 0 : current[itemId] }), {}));
            setSelectedCartItems((current) => Object.keys(current).reduce((nextSelection, itemId) => ({ ...nextSelection, [itemId]: selectedCartItems[itemId] ? false : current[itemId] }), {}));
            setAppliedCoupon(null);
            setCartSizes({});
            setSubmitted(true);
            navigate('/orders');
        } catch (requestError) {
            setError(requestError.message || 'Unable to place order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (getSelectedCartItems() === 0) {
        return (
            <main className="checkout checkout-empty">
                <h1>Your cart is empty</h1>
                <button type="button" onClick={() => navigate('/')}>Continue Shopping</button>
            </main>
        );
    }

    return (
        <main className="checkout">
            <div className="checkout-header">
                <div className="checkout-header-top">
                    <p>CHECKOUT</p>
                    <span>STEP 2 OF 2</span>
                </div>
                <h1>Complete your order</h1>
                <p className="checkout-header-copy">A few details, then we will get everything moving.</p>
            </div>
            {submitted ? (
                <section className="checkout-success">
                    <h2>Order placed successfully</h2>
                    <p>Thank you for your order. We will contact you with delivery details.</p>
                    <button type="button" onClick={() => navigate('/')}>Continue Shopping</button>
                </section>
            ) : (
                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        <h2>Delivery details</h2>
                        <div className="checkout-fields">
                            <label>
                                First name
                                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="First name" />
                            </label>
                            <label>
                                Last name
                                <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Last name" />
                            </label>
                        </div>
                        <label>
                            Email address
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                        </label>
                        <label>
                            Street address
                            <input name="street" type="text" required value={formData.street} onChange={handleChange} placeholder="Street address" />
                        </label>
                        <div className="checkout-fields">
                            <label>
                                City
                                <input name="city" type="text" required value={formData.city} onChange={handleChange} placeholder="City" />
                            </label>
                            <label>
                                State
                                <input name="state" type="text" required value={formData.state} onChange={handleChange} placeholder="State" />
                            </label>
                        </div>
                        <div className="checkout-fields">
                            <label>
                                Postal code
                                <input name="postalCode" type="text" required value={formData.postalCode} onChange={handleChange} placeholder="Postal code" />
                            </label>
                            <label>
                                Country
                                <input name="country" type="text" required value={formData.country} onChange={handleChange} placeholder="Country" />
                            </label>
                        </div>
                        <div className="checkout-fields">
                            <label>
                                Phone number
                                <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                            </label>
                        </div>
                        <fieldset className="checkout-payment">
                            <legend>Payment method</legend>
                            <label className="checkout-method">
                                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(event) => setPaymentMethod(event.target.value)} />
                                Cash on delivery
                            </label>
                            <label className="checkout-method">
                                <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={(event) => setPaymentMethod(event.target.value)} />
                                Razorpay
                            </label>
                        </fieldset>
                        {error && <p className="checkout-error">{error}</p>}
                        <button className="checkout-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Placing order...' : 'Place Order'}
                        </button>
                    </form>
                    <aside className="checkout-summary">
                        <h2>Order summary</h2>
                        <div>
                            <span>Items</span>
                            <strong>{getSelectedCartItems()}</strong>
                        </div>
                        <div>
                            <span>Subtotal</span>
                            <strong>₹{getDiscountedSelectedCartAmount().toFixed(2)}</strong>
                        </div>
                        <div>
                            <span>Shipping</span>
                            <strong>Free</strong>
                        </div>
                        <hr />
                        <div className="checkout-total">
                            <span>Total</span>
                            <strong>₹{getDiscountedSelectedCartAmount().toFixed(2)}</strong>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
