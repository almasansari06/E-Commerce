import React, { useEffect, useState } from 'react'
import './AddProduct.css'
import upload_area from '../../Assets/upload_area.svg'
import adminFetch from '../../utils/adminFetch'

const AddProduct = () => {

    const [images,setImages ] =useState([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productTypes, setProductTypes] = useState([]);
    const [newProductType, setNewProductType] = useState('');
    const [managedProductTypeId, setManagedProductTypeId] = useState('');
    const[productDetails,setProductDetails] = useState({
      name:"",
      description:"",
      productType:"",
      category:"women",
      new_price:"",
      old_price:"",
      availableSizes: [],
      isNewCollection: false,
    })

    const imageHandler =(e)=>{
        setImages(Array.from(e.target.files).slice(0, 10));
    }

    const changeHandler =(e)=>{
      setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }

    useEffect(() => {
      adminFetch('http://localhost:4000/admin/product-types').then((response) => response.json()).then((data) => {
        if (data.success) setProductTypes(data.productTypes || []);
      }).catch(() => {});
    }, []);

    const addProductType = async () => {
      const name = newProductType.trim();
      if (!name) return;
      const response = await adminFetch('http://localhost:4000/admin/product-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok || !data.success) { setMessage(data.message || 'Unable to add product type.'); return; }
      setProductTypes((current) => [...current, data.productType]);
      setProductDetails((current) => ({ ...current, productType: data.productType.name }));
      setManagedProductTypeId(data.productType._id);
      setNewProductType('');
    };

    const editProductType = async (productType) => {
      const name = window.prompt('Edit product type', productType.name)?.trim();
      if (!name || name === productType.name) return;
      const response = await adminFetch(`http://localhost:4000/admin/product-types/${productType._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (data.success) {
        setProductTypes((current) => current.map((item) => item._id === productType._id ? data.productType : item));
        if (productDetails.productType === productType.name) setProductDetails((current) => ({ ...current, productType: name }));
      } else setMessage(data.message || 'Unable to edit product type.');
    };

    const deleteProductType = async (productType) => {
      if (!window.confirm(`Delete product type "${productType.name}"?`)) return;
      const response = await adminFetch(`http://localhost:4000/admin/product-types/${productType._id}`, { method: 'DELETE' });
      if (response.ok) {
        setProductTypes((current) => current.filter((item) => item._id !== productType._id));
        if (managedProductTypeId === productType._id) setManagedProductTypeId('');
        if (productDetails.productType === productType.name) setProductDetails((current) => ({ ...current, productType: '' }));
      }
    };

    const Add_Product =async(event)=>{
      event.preventDefault();
      if (images.length === 0) {
        setMessage('Please select at least one product image.');
        return;
      }
      setIsSubmitting(true);
      setMessage('');
      let responseData;
      let product = { ...productDetails };

      let formData = new FormData();
      images.forEach((image) => formData.append('products', image));

      await fetch('http://localhost:4000/upload',{
        method:'POST',
        headers:{
          Accept:'application/json',
        },
        body:formData,
      }).then((resp)=>resp.json()).then((data)=>{responseData = data});
      
      if(responseData.success)
      {
        product.image = responseData.image_urls || [responseData.image_url];
        console.log(product);

        await fetch('http://localhost:4000/addproduct',{
          method:'POST',
          headers:{
            Accept:'application/json',
            'content-Type':'application/json',
          },
          body:JSON.stringify(product),
        }).then((resp)=>resp.json()).then((data)=>{
          if (data.success) {
            setMessage('Product added successfully.');
            setProductDetails({ name: '', description: '', productType: '', category: 'women', new_price: '', old_price: '', availableSizes: [], isNewCollection: false });
            setImages([]);
          } else {
            setMessage(data.message || 'Unable to add product.');
          }
        });
      } else {
        setMessage(responseData.message || 'Image upload failed.');
      }
      setIsSubmitting(false);
    }

  return (
    <form className='add-product' onSubmit={Add_Product}>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input required value ={productDetails.name} onChange={changeHandler} type="text" name='name'placeholder='Type here' />
      </div>
      <div className="addproduct-itemfield">
        <p>Description</p>
        <textarea required value={productDetails.description} onChange={changeHandler} name="description" placeholder="Describe the product" rows="4" />
      </div>
      <div className="addproduct_price">
        <div className="addproduct-itemfield">
            <p>Price</p>
            <input required min="0" value={productDetails.old_price} onChange={changeHandler} type="number" name='old_price' placeholder='Type here' />
        </div>
        <div className="addproduct-itemfield">
            <p>Offer Price</p>
            <input required min="0" value={productDetails.new_price} onChange={changeHandler} type="number" name='new_price' placeholder='Type here' />
        </div>
      </div>
      <div className="addproduct-category-type-row">
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select required value={productDetails.productType} onChange={changeHandler} name="productType" className='add-product-selector'>
            <option value="" disabled>Choose product type</option>
            {productTypes.map((type) => <option key={type._id} value={type.name}>{type.name}</option>)}
        </select>
        <div className="addproduct-type-manager">
          <input value={newProductType} onChange={(event) => setNewProductType(event.target.value)} placeholder="Add product type" />
          <button type="button" onClick={addProductType}>Add Type</button>
        </div>
        <div className="addproduct-type-manager">
          <select value={managedProductTypeId} onChange={(event) => setManagedProductTypeId(event.target.value)} aria-label="Select product type to manage">
            <option value="">Manage product type</option>
            {productTypes.map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}
          </select>
          {managedProductTypeId && <><button type="button" onClick={() => editProductType(productTypes.find((type) => type._id === managedProductTypeId))}>Edit</button><button type="button" onClick={() => deleteProductType(productTypes.find((type) => type._id === managedProductTypeId))}>Delete</button></>}
        </div>
      </div>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
            {images.length ? <div className="addproduct-preview-grid">{images.map((image) => <img key={image.name + image.lastModified} src={URL.createObjectURL(image)} className="addproduct-thumnail-img" alt="" />)}</div> : <img src={upload_area} className="addproduct-thumnail-img"alt="" />}
        </label>
        <input onChange ={imageHandler} accept="image/*" multiple type="file" name ='images' id = 'file-input' hidden />
      </div>
      <div className="addproduct-itemfield">
        <p>Available Sizes</p>
        <div className="admin-size-options">
          <div className="admin-size-group"><span>Clothing</span>{['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => <label key={size}><input type="checkbox" checked={productDetails.availableSizes.includes(size)} onChange={() => setProductDetails((current) => ({ ...current, availableSizes: current.availableSizes.includes(size) ? current.availableSizes.filter((item) => item !== size) : [...current.availableSizes, size] }))} />{size}</label>)}</div>
          <div className="admin-size-group"><span>Footwear</span>{['6', '7', '8', '9', '10'].map((size) => <label key={size}><input type="checkbox" checked={productDetails.availableSizes.includes(size)} onChange={() => setProductDetails((current) => ({ ...current, availableSizes: current.availableSizes.includes(size) ? current.availableSizes.filter((item) => item !== size) : [...current.availableSizes, size] }))} />{size}</label>)}</div>
        </div>
      </div>
      <label className="addproduct-new-collection"><input type="checkbox" checked={productDetails.isNewCollection} onChange={(event) => setProductDetails((current) => ({ ...current, isNewCollection: event.target.checked }))} /> Show this product in New Collection</label>
      

    {message && <p className="addproduct-message">{message}</p>}
    <button type="submit" disabled={isSubmitting} className='addproduct-btn'>{isSubmitting ? 'ADDING...' : 'ADD PRODUCT'}</button>
    </form>
  )
}

export default AddProduct
