import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Checkout.css';

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

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

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
            const response = await fetch('http://localhost:4000/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({
                    items,
                    amount: getDiscountedSelectedCartAmount(),
                    address: formData,
                    paymentMethod,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to place order.');
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
                <p>CHECKOUT</p>
                <h1>Complete your order</h1>
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
                                Online payment
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
                            <strong>${getDiscountedSelectedCartAmount().toFixed(2)}</strong>
                        </div>
                        <div>
                            <span>Shipping</span>
                            <strong>Free</strong>
                        </div>
                        <hr />
                        <div className="checkout-total">
                            <span>Total</span>
                            <strong>${getDiscountedSelectedCartAmount().toFixed(2)}</strong>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
