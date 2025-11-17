import React, { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");

  // Mobile fields
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [battery, setBattery] = useState("");
  const [display, setDisplay] = useState("");
  const [processor, setProcessor] = useState("");
  const [camera, setCamera] = useState("");
  const [os, setOs] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const res = await get("/categories/by-seller");
    setCategories(res || []);
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    const form = new FormData();
    form.append("name", name);
    form.append("brand", brand);
    form.append("description", description);
    form.append("price", price);
    form.append("qty", qty);

    // Mobile fields
    form.append("ram", ram);
    form.append("storage", storage);
    form.append("battery", battery);
    form.append("display", display);
    form.append("processor", processor);
    form.append("camera", camera);
    form.append("os", os);
    form.append("color", color);

    const categoryValue = document.querySelector("#category").value;
    if (categoryValue) form.append("category", categoryValue);

    for (let i = 0; i < images.length; i++) {
      form.append("images", images[i]);
    }

    const res = await post("/products", form, true);

    if (res && res._id) {
      setMsg("Product Created Successfully");
      navigate("/seller/products");
    } else {
      setMsg("Failed to create product");
    }
  }

  return (
    <div className="add-product">
      <h1>Add New Mobile Product</h1>

      <form className="add-form" onSubmit={submit}>
        
        <label>Product Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />

        <label>Brand</label>
        <input value={brand} onChange={e => setBrand(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" />

        <label>Price (₹)</label>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />

        <label>Quantity</label>
        <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />

        {/* Mobile Fields */}
        <h2>Mobile Specifications</h2>

        <label>RAM</label>
        <input value={ram} onChange={e => setRam(e.target.value)} placeholder="8GB / 12GB" />

        <label>Storage</label>
        <input value={storage} onChange={e => setStorage(e.target.value)} placeholder="128GB / 256GB" />

        <label>Battery</label>
        <input value={battery} onChange={e => setBattery(e.target.value)} placeholder="5000mAh" />

        <label>Display</label>
        <input value={display} onChange={e => setDisplay(e.target.value)} placeholder='6.7" AMOLED' />

        <label>Processor</label>
        <input value={processor} onChange={e => setProcessor(e.target.value)} placeholder="Snapdragon 8 Gen 1" />

        <label>Camera</label>
        <input value={camera} onChange={e => setCamera(e.target.value)} placeholder="50MP + 12MP" />

        <label>OS</label>
        <input value={os} onChange={e => setOs(e.target.value)} placeholder="Android 13 / iOS" />

        <label>Color</label>
        <input value={color} onChange={e => setColor(e.target.value)} placeholder="Black, Blue..." />

        <label>Category</label>
        <div className="category-row">
          <select id="category">
            <option value="">-- None --</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <button
            type="button"
            className="create-cat-btn"
            onClick={() => navigate("/seller/categories")}
          >
            + New
          </button>
        </div>

        <label>Images</label>
        <input type="file" multiple onChange={e => setImages(e.target.files)} />

        <button className="btn" type="submit">Add Product</button>

        {msg && <div className="status">{msg}</div>}
      </form>
    </div>
  );
}
