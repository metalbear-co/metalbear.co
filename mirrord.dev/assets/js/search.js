window.addEventListener('DOMContentLoaded', (event) => {
  new PagefindUI({ element: "#search", showSubResults: true, pageSize: 5, baseUrl: "/mirrord/", showImages: false });
});