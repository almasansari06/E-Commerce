
import React, { createContext, useEffect, useState, } from "react";
import { apiUrl } from '../utils/api';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
};



const ShopContextProvider = (props) => {

    const [all_product,setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [cartSizes, setCartSizes] = useState({});
    const [selectedCartItems, setSelectedCartItems] = useState({});
    const [appliedCoupon, setAppliedCoupon] = useState(null);


    useEffect(() => {
        fetch(apiUrl('/allproducts'))
        .then((response) => response.json())
        .then((data) => setAll_Product(data))
        .catch(() => setAll_Product([]));

        if(localStorage.getItem('auth-token')) {
            fetch(apiUrl('/getcart'),{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
            .then((data)=>{
                setCartItems(data);
                setSelectedCartItems(Object.keys(data).reduce((selected, itemId) => ({ ...selected, [itemId]: data[itemId] > 0 }), {}));
            })
            .catch(() => setCartItems(getDefaultCart()));
        }
    },[])

    const addToCart = (itemsId, size) => {
        setCartItems((prev) => ({...prev,[itemsId]: prev[itemsId] + 1,
        }));
        setSelectedCartItems((prev) => ({ ...prev, [itemsId]: true }));
        if (size) setCartSizes((prev) => ({ ...prev, [itemsId]: size }));
        if (localStorage.getItem('auth-token')) {
            fetch(apiUrl('/addtocart'),{
                method:'Post',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemsId }),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data))
            .catch(() => {});
        }
    }

    const removeFromCart = (itemsId) => {
        setCartItems((prev) => ({...prev,[itemsId]: prev[itemsId] - 1,}));
        setCartSizes((prev) => {
            const next = { ...prev };
            delete next[itemsId];
            return next;
        });
        if(localStorage.getItem('auth-token')){
            fetch(apiUrl('/removefromcart'),{
                method:'Post',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemsId }),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data))
            .catch(() => {});
        }
    };

    const getCartSize = (itemsId) => cartSizes[itemsId] || '';
    const toggleCartSelection = (itemsId) => setSelectedCartItems((prev) => ({ ...prev, [itemsId]: !prev[itemsId] }));
    const getSelectedCartItems = () => Object.keys(cartItems).reduce((total, itemId) => {
        const productExists = all_product.some((product) => product.id === Number(itemId));
        return total + (productExists && cartItems[itemId] > 0 && selectedCartItems[itemId] ? cartItems[itemId] : 0);
    }, 0);
    const getSelectedCartAmount = () => Object.keys(cartItems).reduce((total, itemId) => {
        if (cartItems[itemId] <= 0 || !selectedCartItems[itemId]) return total;
        const product = all_product.find((item) => item.id === Number(itemId));
        return total + (product ? product.new_price * cartItems[itemId] : 0);
    }, 0);
    const getDiscountedSelectedCartAmount = () => {
        const subtotal = getSelectedCartAmount();
        return appliedCoupon ? subtotal - (subtotal * appliedCoupon.discountPercentage / 100) : subtotal;
    };

    const applyCoupon = async (code) => {
        const response = await fetch(apiUrl('/coupons/validate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Invalid coupon code.');
        setAppliedCoupon(data);
        return data;
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => Object.keys(cartItems).reduce((total, itemId) => {
        const productExists = all_product.some((product) => product.id === Number(itemId));
        return total + (productExists && cartItems[itemId] > 0 ? cartItems[itemId] : 0);
    }, 0);

    const contextValue = {getTotalCartItems,getTotalCartAmount,getSelectedCartItems,getSelectedCartAmount,getDiscountedSelectedCartAmount,applyCoupon,appliedCoupon,setAppliedCoupon, all_product, cartItems, setCartItems, selectedCartItems, toggleCartSelection, setSelectedCartItems, cartSizes, getCartSize, setCartSizes, addToCart, removeFromCart };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
