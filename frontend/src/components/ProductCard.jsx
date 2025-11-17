import React from 'react';
import './ProductCard.css';
export default function ProductCard({ product }) {
  return (
    <div className='card'>
      <div className='card-media'><div className='img-placeholder'>📱</div></div>
      <div className='card-body'>
        <h3 className='card-title'>{product.name}</h3>
        <div className='card-meta'>{product.brand || 'Brand'} • {product.category?.name || ''}</div>
        <div className='card-price'>₹ {product.price}</div>
      </div>
    </div>
  );
}
