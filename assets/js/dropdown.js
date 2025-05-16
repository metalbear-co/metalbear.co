document.addEventListener("DOMContentLoaded", function () {
  const submenuParents = document.querySelectorAll(".nav-item.has-submenu");

  submenuParents.forEach((parent) => {
    const toggleBtn = parent.querySelector(".has-submenu-toggle");
    const submenu = parent.querySelector(".submenu");

    toggleBtn?.addEventListener("click", function (e) {
      e.preventDefault();

      // Tutup semua submenu lainnya
      submenuParents.forEach((item) => {
        if (item !== parent) {
          item.querySelector(".submenu")?.classList.remove("submenu-active");
          item
            .querySelector(".has-submenu-toggle")
            ?.classList.remove("submenu-active");
        }
      });

      // Toggle submenu aktif
      submenu?.classList.toggle("submenu-active");
      toggleBtn.classList.toggle("submenu-active");
    });
  });
});
