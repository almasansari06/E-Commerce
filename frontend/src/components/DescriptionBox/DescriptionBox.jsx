import React, { useState } from 'react'
import './DescriptionBox.css'


export default function DescriptionBox({ product }) {
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const description = product?.description || 'No description has been added for this product yet.';
  const [activeTab, setActiveTab] = useState('description');
  const [latestReviews, setLatestReviews] = useState(reviews);

  const showReviews = async () => {
    setActiveTab('reviews');
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      const products = await response.json();
      const currentProduct = products.find((item) => item.id === product.id);
      setLatestReviews(Array.isArray(currentProduct?.reviews) ? currentProduct.reviews : []);
    } catch (error) {
      setLatestReviews(reviews);
    }
  };
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <button type="button" className={`descriptionbox-nav-box ${activeTab === 'description' ? '' : 'fade'}`} onClick={() => setActiveTab('description')}>Description</button>
        <button type="button" className={`descriptionbox-nav-box ${activeTab === 'reviews' ? '' : 'fade'}`} onClick={showReviews}>Reviews ({latestReviews.length})</button>
      </div>
      {activeTab === 'description' ? <div className="descriptionbox-description"><p>{description}</p></div> : <div className="descriptionbox-description descriptionbox-reviews">
        {latestReviews.length === 0 ? <p>No reviews yet. Be the first to review this product.</p> : latestReviews.map((review) => <article key={`${review.userId}-${review.date}`}><div><strong>{review.name || 'Customer'}</strong><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><p>{review.comment}</p></article>)}
      </div>}
    </div>
  )
}
