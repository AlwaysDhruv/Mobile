import React, { useEffect, useState } from "react";
import { get, put, del } from "../../api.js";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewProduct.css";

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Basic fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);

  // Mobile specs
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [battery, setBattery] = useState("");
  const [display, setDisplay] = useState("");
  const [processor, setProcessor] = useState("");
  const [camera, setCamera] = useState("");
  const [os, setOs] = useState("");
  const [color, setColor] = useState("");

  // Load product + categories
  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  // Sync form fields when product loads
  useEffect(() => {
    if (!product) return;

    setName(product.name || "");
    setBrand(product.brand || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setQty(product.qty || "");
    setCategory(product.category?._id || "");

    setRam(product.ram || "");
    setStorage(product.storage || "");
    setBattery(product.battery || "");
    setDisplay(product.display || "");
    setProcessor(product.processor || "");
    setCamera(product.camera || "");
    setOs(product.os || "");
    setColor(product.color || "");
  }, [product]);

  async function loadProduct() {
    const res = await get(`/products/${id}`);

    if (!res || !res._id) {
      console.log("Error loading product", res);
      return;
    }

    setProduct(res);
  }

  async function loadCategories() {
    const res = await get("/categories/by-seller");
    setCategories(res || []);
  }

  async function saveChanges(e) {
    e.preventDefault();

    const form = new FormData();
    form.append("name", name);
    form.append("brand", brand);
    form.append("description", description);
    form.append("price", price);
    form.append("qty", qty);
    form.append("category", category);

    // Mobile fields
    form.append("ram", ram);
    form.append("storage", storage);
    form.append("battery", battery);
    form.append("display", display);
    form.append("processor", processor);
    form.append("camera", camera);
    form.append("os", os);
    form.append("color", color);

    // New images
    for (let i = 0; i < images.length; i++) {
      form.append("images", images[i]);
    }

    await put(`/products/${id}`, form, true);

    setEditMode(false);
    loadProduct();
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    await del(`/products/${id}`);
    navigate("/seller/products");
  }

  if (!product) return <p>Loading...</p>;

  return (
    <div className="vp-wrapper">
      <div className="vp-card">

        {/* IMAGE BOX */}
        <div className="vp-img-box">
          {product.images?.length > 0 ? (
            <img src={product.images[0]} alt="product" />
          ) : (
            <div className="no-img">No Image</div>
          )}
        </div>

        {/* VIEW MODE */}
        {!editMode && (
          <>
            <h2>{product.name}</h2>
            <p className="v-brand">{product.brand || "—"}</p>
            <p className="v-price">₹{product.price}</p>
            <p>Qty: {product.qty}</p>
            <p>Category: {product.category?.name || "None"}</p>

            <div className="spec-box">
              {product.ram && <p><b>RAM:</b> {product.ram}</p>}
              {product.storage && <p><b>Storage:</b> {product.storage}</p>}
              {product.battery && <p><b>Battery:</b> {product.battery}</p>}
              {product.display && <p><b>Display:</b> {product.display}</p>}
              {product.processor && <p><b>Processor:</b> {product.processor}</p>}
              {product.camera && <p><b>Camera:</b> {product.camera}</p>}
              {product.os && <p><b>OS:</b> {product.os}</p>}
              {product.color && <p><b>Color:</b> {product.color}</p>}
            </div>

            <p className="v-desc">{product.description || "No description."}</p>

            <div className="vp-actions">
              <button className="edit-btn" onClick={() => setEditMode(true)}>Edit</button>
              <button className="delete-btn" onClick={remove}>Delete</button>
            </div>
          </>
        )}

        {/* EDIT MODE */}
        {editMode && (
          <form className="vp-form" onSubmit={saveChanges}>
            
            <h3>Edit Product</h3>

            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Product Name" />

            <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand" />

            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Description" />

            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="Price" />

            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="Quantity" />

            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">None</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            {/* MOBILE FIELDS */}
            <h3>Mobile Specifications</h3>

            <input value={ram} onChange={e => setRam(e.target.value)} placeholder="RAM (example 8GB)" />
            <input value={storage} onChange={e => setStorage(e.target.value)} placeholder="Storage (example 128GB)" />
            <input value={battery} onChange={e => setBattery(e.target.value)} placeholder="Battery (5000mAh)" />
            <input value={display} onChange={e => setDisplay(e.target.value)} placeholder='Display size (6.7")' />
            <input value={processor} onChange={e => setProcessor(e.target.value)} placeholder="Processor (Snapdragon)" />
            <input value={camera} onChange={e => setCamera(e.target.value)} placeholder="Camera (50MP + 8MP)" />
            <input value={os} onChange={e => setOs(e.target.value)} placeholder="OS (Android 13)" />
            <input value={color} onChange={e => setColor(e.target.value)} placeholder="Color (Black, Blue...)" />

            <label>Replace Images</label>
            <input type="file" multiple onChange={e => setImages(e.target.files)} />

            <button className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
