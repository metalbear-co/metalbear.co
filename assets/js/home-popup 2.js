document.addEventListener("DOMContentLoaded", function () {
  const subscribeButton = document.querySelector(".subscribe-button");
  const newsletterPopup = document.querySelector(".section-newsletter-popup");
  const newsletterWrapper = document.querySelector(
    ".section-newsletter__wrapper"
  );

  // Menampilkan popup saat tombol Subscribe ditekan
  subscribeButton.addEventListener("click", function () {
    newsletterPopup.style.display = "block";
  });

  // Menutup popup jika area di luar newsletterWrapper ditekan
  document.addEventListener("click", function (event) {
    if (
      !newsletterWrapper.contains(event.target) &&
      !subscribeButton.contains(event.target)
    ) {
      newsletterPopup.style.display = "none";
    }
  });
});
