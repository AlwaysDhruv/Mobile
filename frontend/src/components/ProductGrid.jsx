import React from 'react';
import ProductCard from './ProductCard.jsx';
import './ProductGrid.css';
export default function ProductGrid({ products }) {
  if (!products || products.length === 0) return <div className='empty'>No products found.</div>;
  return <div className='grid'>{products.map(p => <ProductCard key={p._id} product={p} />)}</div>;
}
