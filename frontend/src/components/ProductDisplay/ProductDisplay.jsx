import React, { useContext, useState } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { apiUrl, assetUrl } from '../../utils/api';

export default function ProductDisplay(props) {
    const{product} = props
    const {addToCart}= useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSizeGroup, setSelectedSizeGroup] = useState('');
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const footwearSizes = ['6', '7', '8', '9', '10'];
  const sizes = [...clothingSizes, ...footwearSizes];
  const availableSizes = Array.isArray(product.availableSizes) ? product.availableSizes : sizes;
  const images = Array.isArray(product.image) ? product.image : [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [localReviews, setLocalReviews] = useState(Array.isArray(product.reviews) ? product.reviews : []);
  const reviews = localReviews;
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length : 0;

  const selectSize = (size, group) => {
    if (!availableSizes.includes(size)) return;
    setSelectedSize(size);
    setSelectedSizeGroup(group);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setReviewMessage('Please login to leave a review.');
      return;
    }
    try {
      const response = await fetch(apiUrl(`/products/${product.id}/reviews`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'auth-token': token },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to submit review.');
      setLocalReviews((current) => [...current, data.review]);
      setReviewMessage('Review submitted successfully.');
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      setReviewMessage(error.message);
    }
  };
  const hasClothingSizes = availableSizes.some((size) => clothingSizes.includes(size));
  const hasFootwearSizes = availableSizes.some((size) => footwearSizes.includes(size));
  const visibleSizeGroup = selectedSizeGroup || (hasClothingSizes && !hasFootwearSizes ? 'clothing' : (!hasClothingSizes && hasFootwearSizes ? 'footwear' : ''));
  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
            {images.map((image) => <img key={image} className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)} src={assetUrl(image)} alt={product.name} />)}
        </div>
        <div className="productdisplay-img">
            <img className='productdisplay-main-img' src={assetUrl(selectedImage)} alt={product.name} />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          {[1, 2, 3, 4, 5].map((star) => <img key={star} src={star <= Math.round(averageRating) ? star_icon : star_dull_icon} alt="" />)}
          <p>({reviews.length})</p>
        </div>
        <div className="productdisplay-right-prices">
            <div className="productdisplay-right-price-old">₹{product.old_price}</div>
            <div className="productdislpay-right-price-new">₹{product.new_price}</div>
        </div>
        <div className="productdisplay-right-description">
          {product.description || 'A thoughtfully designed piece made for everyday wear.'}
        </div>
        <div className="productdisplay-right-size">
            <h1>Select Size</h1>
            <div className="productdisplay-right-sizes">
              {(!visibleSizeGroup || visibleSizeGroup === 'clothing') && <div className="product-size-group"><span className="product-size-group-label">Clothing</span>{clothingSizes.map((size) => (
                <div
                  key={size}
                  className={`${selectedSize === size ? 'selected' : ''} ${availableSizes.includes(size) ? '' : 'unavailable'}`}
                  onClick={() => selectSize(size, 'clothing')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      selectSize(size, 'clothing');
                    }
                  }}
                  role="button"
                  tabIndex="0"
                  aria-pressed={selectedSize === size}
                  aria-disabled={!availableSizes.includes(size)}
                >
                  {size}
                </div>
              ))}</div>}
              {(!visibleSizeGroup || visibleSizeGroup === 'footwear') && <div className="product-size-group"><span className="product-size-group-label">Footwear</span>{footwearSizes.map((size) => (
                <div
                  key={size}
                  className={`${selectedSize === size ? 'selected' : ''} ${availableSizes.includes(size) ? '' : 'unavailable'}`}
                  onClick={() => selectSize(size, 'footwear')}
                  role="button"
                  tabIndex="0"
                  aria-pressed={selectedSize === size}
                  aria-disabled={!availableSizes.includes(size)}
                >{size}</div>
              ))}</div>}

            </div>
        </div>
        <button disabled={!selectedSize} onClick={()=>{addToCart(product.id, selectedSize)}}>{selectedSize ? 'ADD TO CART' : 'SELECT A SIZE'}</button>
        <p className='productdisplay-right-category'><span>Category :</span>{product.category}</p>
        <p className='productdisplay-right-category'><span>Type :</span>{product.productType || 'clothing'}</p>
        <div className="product-review-box">
          <h3>Customer reviews</h3>
          {reviews.length > 0 && reviews.map((review) => <div className="product-review" key={`${review.userId}-${review.date}`}><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><p>{review.comment}</p></div>)}
          <form onSubmit={submitReview}>
            <div className="review-rating-input">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} className={star <= reviewRating ? 'chosen' : ''} onClick={() => setReviewRating(star)} aria-label={`Give ${star} stars`}>★</button>)}</div>
            <textarea required value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Write your review" rows="3" />
            <button type="submit">Submit Review</button>
          </form>
          {reviewMessage && <p className="review-message">{reviewMessage}</p>}
        </div>
      </div>
    </div>
  )
}
