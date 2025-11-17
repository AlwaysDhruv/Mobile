import React, { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import "./BuyerHome.css";

export default function BuyerHome() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [viewProduct, setViewProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    const res = await get("/products");

    if (Array.isArray(res)) {
      const fixed = res.map((p) => ({
        ...p,
        images: (p.images || []).map((img) =>
          img.startsWith("http") ? img : `http://localhost:5000${img}`
        ),
      }));

      setProducts(fixed);
      setAllProducts(fixed);
    } else {
      setProducts([]);
      setAllProducts([]);
    }
  }

  async function loadCategories() {
    const res = await get("/categories/all");
    setCategories(Array.isArray(res) ? res : []);
  }

  // Filtering
  function filterProducts(text, cat) {
    let list = [...allProducts];

    if (cat) list = list.filter((p) => p.category?._id === cat);
    if (text) list = list.filter((p) => p.name.toLowerCase().includes(text.toLowerCase()));

    setProducts(list);
  }

  function handleSearch(text) {
    setSearch(text);
    filterProducts(text, category);
  }

  function handleCategory(cat) {
    setCategory(cat);
    filterProducts(search, cat);
  }

  async function addToCart(productId) {
    const res = await post("/orders/cart", { productId });
    alert(res.message || "Added to cart!");
  }

  function goToStore(storeId) {
    window.location.href = `/buyer/store/${storeId}`;
  }

  return (
    <div className="buyer-home">

      {/* Search Bar */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search mobiles, brands..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => handleCategory(e.target.value)}>
          <option value="">All Series</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {products.length === 0 && <p className="no-result">No products found.</p>}

        {products.map((p) => (
          <div key={p._id} className="product-card">
            <img
              src={p.images?.[0] || "/no-img.png"}
              alt={p.name}
              onClick={() => setViewProduct(p)}
            />

            <h3>{p.name}</h3>
            <p className="brand">{p.brand}</p>
            <p className="price">₹{p.price}</p>

            <button className="btn" onClick={() => addToCart(p._id)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      {viewProduct && (
        <div className="modal" onClick={() => setViewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setViewProduct(null)}>
              &times;
            </span>

            {/* Image Section */}
            <div className="modal-img-box">
              <img
                className="modal-img"
                src={viewProduct.images?.[0] || "/no-img.png"}
                alt={viewProduct.name}
              />

              <div className="thumb-row">
                {viewProduct.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="thumb"
                    onClick={() =>
                      setViewProduct({
                        ...viewProduct,
                        images: [img, ...viewProduct.images],
                      })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <h2>{viewProduct.name}</h2>
            <p className="modal-brand">{viewProduct.brand}</p>
            <p className="modal-price">₹{viewProduct.price}</p>
            <p className="modal-desc">{viewProduct.description}</p>

            {/* Specifications */}
            <h3 className="spec-title">Mobile Specifications</h3>
            <table className="spec-table">
              <tbody>
                <tr><td>RAM</td><td>{viewProduct.ram || "—"}</td></tr>
                <tr><td>Storage</td><td>{viewProduct.storage || "—"}</td></tr>
                <tr><td>Battery</td><td>{viewProduct.battery || "—"}</td></tr>
                <tr><td>Display</td><td>{viewProduct.display || "—"}</td></tr>
                <tr><td>Processor</td><td>{viewProduct.processor || "—"}</td></tr>
                <tr><td>Camera</td><td>{viewProduct.camera || "—"}</td></tr>
                <tr><td>Operating System</td><td>{viewProduct.os || "—"}</td></tr>
                <tr><td>Color</td><td>{viewProduct.color || "—"}</td></tr>
              </tbody>
            </table>

            {/* ADD TO CART BUTTON */}
            <button className="btn" onClick={() => addToCart(viewProduct._id)}>
              Add to Cart
            </button>

            {/* NEW BUTTON — GO TO STORE PAGE */}
            <button
              className="store-btn"
              onClick={() => goToStore(viewProduct.store?._id)}
            >
              Visit Store Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
