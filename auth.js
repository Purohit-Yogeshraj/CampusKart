document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const authForms = document.querySelectorAll(".auth-form");

  // Auto-show login form
  document.getElementById("login-form").classList.add("active");
  document.querySelector('[data-target="login"]').classList.add("active");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      authForms.forEach((form) => form.classList.remove("active"));

      button.classList.add("active");
      const target = button.getAttribute("data-target");
      document.getElementById(`${target}-form`).classList.add("active");
    });
  });

  // ===== LOGIN AJAX =====
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent page reload

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      fetch("login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(email)}&pass=${encodeURIComponent(
          password
        )}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert(data.message);
            window.location.href = "index.html"; // Redirect on success
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Something went wrong. Please try again.");
        });
    });
  }

  // ===== SIGNUP AJAX =====
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        username: document.getElementById("signup-name").value,
        gender:
          document.querySelector('input[name="gender"]:checked')?.value || "",
        dob: document.getElementById("signup-dob").value,
        email: document.getElementById("signup-email").value,
        contact: document.getElementById("signup-phone").value,
        pass1: document.getElementById("signup-password").value,
        pass2: document.getElementById("signup-confirm-password").value,
      };

      // Client-side validation
      if (
        !formData.username ||
        !formData.gender ||
        !formData.dob ||
        !formData.email ||
        !formData.contact ||
        !formData.pass1 ||
        !formData.pass2
      ) {
        alert("Please fill all fields.");
        return;
      }

      fetch("signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          if (data.success) {
            // Switch to login form after successful signup
            toggleButtons.forEach((btn) => btn.classList.remove("active"));
            authForms.forEach((form) => form.classList.remove("active"));

            document
              .querySelector('[data-target="login"]')
              .classList.add("active");
            document.getElementById("login-form").classList.add("active");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Registration failed. Please try again.");
        });
    });
  }
});
