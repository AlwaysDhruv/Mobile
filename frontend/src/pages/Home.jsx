import React, { useEffect, useState, useRef } from "react";
import { post } from "../api.js";
import "../styles/Home.css";

export default function Home() {
  const [cname, setCname] = useState("");
  const [cemail, setCemail] = useState("");
  const [cmessage, setCmessage] = useState("");
  const [status, setStatus] = useState("");

  const contactRef = useRef(null);

  // greeting
  const hour = new Date().getHours();
  let greeting = "Welcome";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  function scrollToContact() {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function submitContact(e) {
    e.preventDefault();
    setStatus("Sending...");

    const res = await post("/contact", {
      name: cname,
      email: cemail,
      message: cmessage,
    });

    if (res && res.id) {
      setStatus("Message Sent ✓");
      setCname("");
      setCemail("");
      setCmessage("");
    } else {
      setStatus("Failed to send");
    }

    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="home">

      {/* HERO */}
      <div className="hero">
        <h1>{greeting}, Welcome to MobileShop.</h1>
        <p>Your trusted place to explore premium smartphones.</p>

        <div className="hero-buttons">
          <a href="/register" className="btn">Get Started</a>
          <button className="btn" onClick={scrollToContact}>
            Contact Us
          </button>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="contact-container" ref={contactRef}>
        <h2>Contact Us</h2>
        <p>Send your message to all sellers in one click.</p>

        <form onSubmit={submitContact} className="contact-form">
          <input
            placeholder="Your Name"
            value={cname}
            onChange={(e) => setCname(e.target.value)}
            required
          />
          <input
            placeholder="Your Email"
            value={cemail}
            onChange={(e) => setCemail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Message"
            value={cmessage}
            onChange={(e) => setCmessage(e.target.value)}
            rows="5"
            required
          ></textarea>
          <button className="btn" type="submit">Send</button>
          <div className="form-status">{status}</div>
        </form>
      </div>

    </div>
  );
}
