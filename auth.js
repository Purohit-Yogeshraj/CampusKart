document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const authForms = document.querySelectorAll(".auth-form");

  // Auto-show login form
  document.getElementById("login-form").classList.add("active");
  document.querySelector('[data-target="login"]').classList.add("active");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active from all
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      authForms.forEach((form) => form.classList.remove("active"));

      // Add active to clicked
      button.classList.add("active");
      const target = button.getAttribute("data-target");
      document.getElementById(`${target}-form`).classList.add("active");
    });
  });

  // Optional: Add form validation later
  // For now, forms work as demo
});
