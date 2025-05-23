document.addEventListener("DOMContentLoaded", function () {
  // Offcanvas Toggle Functionality
  const menuButton = document.querySelector(".btn-menu");
  const offcanvas = document.querySelector(".offcanvas");
  const dismissButton = document.querySelector("#menuDismissButton");

  function showOffcanvas() {
    offcanvas.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function hideOffcanvas() {
    offcanvas.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      if (offcanvas.classList.contains("show")) {
        hideOffcanvas();
      } else {
        showOffcanvas();
      }
    });
  }

  if (dismissButton) {
    dismissButton.addEventListener("click", hideOffcanvas);
  }

  if (offcanvas) {
    offcanvas.addEventListener("click", function (e) {
      if (e.target === offcanvas) {
        hideOffcanvas();
      }
    });
  }

  // Submenu Toggle Functionality
  const submenuParents = document.querySelectorAll(".nav-item.has-submenu");

  submenuParents.forEach((parent) => {
    const toggleBtn = parent.querySelector(".has-submenu-toggle");
    const submenu = parent.querySelector(".submenu");

    if (toggleBtn && submenu) {
      toggleBtn.addEventListener("click", function (e) {
        e.preventDefault();

        // Close other submenus first
        submenuParents.forEach((item) => {
          if (item !== parent) {
            item.querySelector(".submenu")?.classList.remove("submenu-active");
            item
              .querySelector(".has-submenu-toggle")
              ?.classList.remove("submenu-active");
          }
        });

        // Toggle current submenu
        submenu.classList.toggle("submenu-active");
        toggleBtn.classList.toggle("submenu-active");
      });

      // Close submenu when clicking outside
      document.addEventListener("click", function (e) {
        if (!parent.contains(e.target)) {
          submenu.classList.remove("submenu-active");
          toggleBtn.classList.remove("submenu-active");
        }
      });
    }
  });

  // Close submenus when clicking on a nav link (optional)
  const navLinks = document.querySelectorAll(
    ".nav-link:not(.has-submenu-toggle)",
  );
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      submenuParents.forEach((parent) => {
        parent.querySelector(".submenu")?.classList.remove("submenu-active");
        parent
          .querySelector(".has-submenu-toggle")
          ?.classList.remove("submenu-active");
      });
      hideOffcanvas(); // Also close the offcanvas menu on mobile
    });
  });
});
