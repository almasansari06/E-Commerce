import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import Item from '../Item/Item';
import './ProductBrowser.css';
import { apiUrl } from '../../utils/api';

export default function ProductBrowser({ title = 'Shop all', category = '', showSidebar = false, showHeading = true }) {
    const { all_product } = useContext(ShopContext);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search') || '';
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [selectedProductType, setSelectedProductType] = useState('');
    const [productTypes, setProductTypes] = useState([]);
    const [sortBy, setSortBy] = useState('featured');

    useEffect(() => {
        if (!showSidebar) return;
        fetch(apiUrl('/product-types'))
            .then((response) => response.json())
            .then((data) => setProductTypes(Array.isArray(data) ? data : []))
            .catch(() => setProductTypes([]));
    }, [showSidebar]);

    const availableProductTypes = [...new Set([
        ...productTypes.map((type) => type.name),
        ...all_product.map((product) => product.productType).filter(Boolean),
    ])].sort();

    const filteredProducts = all_product
        .filter((product) => !selectedCategory || product.category === selectedCategory)
        .filter((product) => !selectedProductType || product.productType === selectedProductType)
        .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
        .sort((first, second) => {
            if (sortBy === 'price-low') return first.new_price - second.new_price;
            if (sortBy === 'price-high') return second.new_price - first.new_price;
            return 0;
        });

    return (
        <section className="product-browser">
            {showHeading && <div className="product-browser-heading">
                <div>
                    <p className="product-browser-eyebrow">CURATED FOR YOU</p>
                    <h2>{title}</h2>
                </div>
                <span>{filteredProducts.length} products</span>
            </div>}
            {showSidebar && <div className="product-browser-filter-bar">
                {!category && (
                    <label>
                        <span>Category</span>
                        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                            <option value="">All categories</option>
                            <option value="women">Women</option>
                            <option value="men">Men</option>
                            <option value="kid">Kids</option>
                        </select>
                    </label>
                )}
                <label>
                    <span>Product type</span>
                    <select value={selectedProductType} onChange={(event) => setSelectedProductType(event.target.value)}>
                        <option value="">All types</option>
                        {availableProductTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                </label>
                <label>
                    <span>Sort by</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: low to high</option>
                        <option value="price-high">Price: high to low</option>
                    </select>
                </label>
            </div>}
            {filteredProducts.length > 0 ? (
                <div className="product-browser-grid">
                    {filteredProducts.map((product) => (
                        <Item key={product.id} id={product.id} name={product.name} image={product.image} new_price={product.new_price} old_price={product.old_price} />
                    ))}
                </div>
            ) : (
                <div className="product-browser-empty">No products match these filters.</div>
            )}
        </section>
    );
}
