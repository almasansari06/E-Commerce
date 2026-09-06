import './CSS/ShopCategory.css';
import ProductBrowser from '../components/ProductBrowser/ProductBrowser';

export default function ShopCategory(props) {
  return (
    <div className='shop-category'>
      <img className= 'shopcategory-banner'src={props.banner} alt="" />
      <ProductBrowser title={`${props.category} collection`} category={props.category} />
    </div>
  );
}
