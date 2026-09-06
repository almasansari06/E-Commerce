import React ,{ useEffect,useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../Assets/cross_icon.png'
import adminFetch from '../../utils/adminFetch'

const ListProduct = () => {

  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productTypes, setProductTypes] = useState([]);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) throw new Error(data.message || 'Unable to load products.');
      setAllProducts(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
    adminFetch('http://localhost:4000/admin/product-types').then((response) => response.json()).then((data) => {
      if (data.success) setProductTypes(data.productTypes || []);
    }).catch(() => {});
  },[])

    const remove_product = async (id) => {
      if (!window.confirm('Remove this product?')) return;
      await fetch('http://localhost:4000/removeproduct',{
        method: 'POST',
        headers: {
          Accept:'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id})

      } )
      await fetchInfo();
    }

    const saveProduct = async (event) => {
      event.preventDefault();
      const response = await fetch('http://localhost:4000/updateproduct', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Unable to update product.');
        return;
      }
      setEditingProduct(null);
      await fetchInfo();
    };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      {error && <p className="listproduct-error">{error}</p>}
      {editingProduct && (
        <form className="listproduct-edit" onSubmit={saveProduct}>
          <input value={editingProduct.name} onChange={(event) => setEditingProduct({...editingProduct, name: event.target.value})} required />
          <input type="number" value={editingProduct.old_price} onChange={(event) => setEditingProduct({...editingProduct, old_price: event.target.value})} required />
          <input type="number" value={editingProduct.new_price} onChange={(event) => setEditingProduct({...editingProduct, new_price: event.target.value})} required />
          <select value={editingProduct.category} onChange={(event) => setEditingProduct({...editingProduct, category: event.target.value})}>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Kid</option>
          </select>
          <select value={editingProduct.productType || ''} onChange={(event) => setEditingProduct({...editingProduct, productType: event.target.value, availableSizes: []})}>
            <option value="" disabled>Choose product type</option>
            {productTypes.map((type) => <option key={type._id} value={type.name}>{type.name}</option>)}
          </select>
          <div className="listproduct-edit-sizes">
            {(editingProduct.productType === 'footwear' ? ['6', '7', '8', '9', '10'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((size) => <label key={size}><input type="checkbox" checked={(editingProduct.availableSizes || []).includes(size)} onChange={() => setEditingProduct({...editingProduct, availableSizes: (editingProduct.availableSizes || []).includes(size) ? editingProduct.availableSizes.filter((item) => item !== size) : [...(editingProduct.availableSizes || []), size]})} />{size}</label>)}
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
        </form>
      )}
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Product Type</p>
        <p>Actions</p>
        
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {loading ? <p>Loading products...</p> : allproducts.map((product,index)=>{
          return <React.Fragment key={product.id || index}>
          <div className="listproduct-format-main listproduct-format">
              <img src={Array.isArray(product.image) ? product.image[0] : product.image} alt={product.name} className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.productType || 'clothing'}</p>
              <div className="listproduct-actions">
                <button type="button" onClick={() => setEditingProduct(product)}>Edit</button>
                <img onClick={()=>{remove_product(product.id)}} className = 'listproduct-remove-icon'src={cross_icon} alt="Remove product" />
              </div>
          </div>
          <hr /></React.Fragment>
        })}
      </div>
    </div>
  )
}

export default ListProduct
