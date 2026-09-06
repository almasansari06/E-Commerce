import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { assetUrl } from '../../utils/api';

export default function CartItems() {
    const { all_product, cartItems, selectedCartItems, toggleCartSelection, removeFromCart, getSelectedCartAmount, getDiscountedSelectedCartAmount, getSelectedCartItems, applyCoupon, appliedCoupon, setAppliedCoupon } = useContext(ShopContext);
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const handleCoupon = async () => {
        setCouponLoading(true);
        setCouponMessage('');
        try {
            const coupon = await applyCoupon(couponCode);
            setCouponMessage(`${coupon.discountPercentage}% discount applied`);
        } catch (error) {
            setAppliedCoupon(null);
            setCouponMessage(error.message);
        } finally {
            setCouponLoading(false);
        }
    };

    return (
        <div className="cartitems-container">
            <div className="cartitem-format-main">
                <p>Select</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitem-format-main">
                                <input className="cartitems-select" type="checkbox" checked={Boolean(selectedCartItems[e.id])} onChange={() => toggleCartSelection(e.id)} aria-label={`Select ${e.name} for checkout`} />
                                <img src={assetUrl(Array.isArray(e.image) ? e.image[0] : e.image)} alt={e.name} className="carticon-product-icon" />
                                <p>{e.name}</p>
                                <p>₹{e.new_price}</p>
                                <button className="cartitems-quantity">{cartItems[e.id]}</button>
                                <p>₹{e.new_price * cartItems[e.id]}</p>
                                <img className='cartitems-remove-items'src={remove_icon}onClick={() => removeFromCart(e.id)}alt="Removecart-remove-icon"/>
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Selected subtotal</p>
                            <p>₹{getSelectedCartAmount()}</p>
                        </div>
                        {appliedCoupon && <div className="cartitems-total-item cartitems-discount"><p>Discount ({appliedCoupon.discountPercentage}%)</p><p>-₹{(getSelectedCartAmount() - getDiscountedSelectedCartAmount()).toFixed(2)}</p></div>}
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>₹{getDiscountedSelectedCartAmount().toFixed(2)}</h3>
                        </div>
                    </div>
                    <button type="button" disabled={getSelectedCartItems() === 0} onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT ({getSelectedCartItems()})</button>
                </div>
                <div className="caritems-promocode">
                    <p>If you have a promo code, Enter it here</p>
                    <div className="cartitems-promobox">
                        <input type="text" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder='promocode' />
                        <button type="button" onClick={handleCoupon} disabled={couponLoading || !couponCode.trim()}>{couponLoading ? 'Checking...' : 'Apply'}</button>
                    </div>
                    {couponMessage && <p className="cartitems-coupon-message">{couponMessage}</p>}
                </div>
            </div>
        </div>
    );
}
