const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem("user")
      );

      window.location.href = "dashboard.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Something went wrong");
  }
});