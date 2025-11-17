const API_BASE = "http://localhost:5000/api"; // adjust if backend port differs

export async function get(url) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_BASE + url, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    }
  });
  return res.json();
}

export async function post(url, data, isForm = false) {
  const token = localStorage.getItem("token");

  const options = {
    method: "POST",
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: data
  };

  // If JSON body
  if (!isForm) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  const res = await fetch(API_BASE + url, options);
  return res.json();
}

export async function put(url, data, isForm = false) {
  const token = localStorage.getItem("token");

  const options = {
    method: "PUT",
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: data
  };

  if (!isForm) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  const res = await fetch(API_BASE + url, options);
  return res.json();
}

export async function del(url) {
  const token = localStorage.getItem("token");
  const res = await fetch(API_BASE + url, {
    method: "DELETE",
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    }
  });
  return res.json();
}

export async function patch(url, data, isForm = false) {
  const token = localStorage.getItem("token");

  const options = {
    method: "PATCH",
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: data
  };

  // If JSON body (not FormData)
  if (!isForm) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  const res = await fetch(API_BASE + url, options);
  return res.json();
}
