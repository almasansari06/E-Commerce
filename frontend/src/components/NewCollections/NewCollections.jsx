import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
import { Link } from 'react-router-dom'
import { apiUrl } from '../../utils/api'

export default function NewCollection() {

   const[new_collection,setNew_collection]=useState([]);
   
   useEffect(() => {
    fetch(apiUrl('/newcollections'))
        .then((response) => response.json())
      .then((data) => setNew_collection(Array.isArray(data) ? data : []))
      .catch(() => setNew_collection([]));
}, []);
  return (
    <div className='new-collections'>
      <h1>NEW COLLECTION</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item,i)=>{
                 return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
        })}
      </div>
      <Link className="new-collections-more" to="/collection">View more <span>→</span></Link>
    </div>
  )
}
