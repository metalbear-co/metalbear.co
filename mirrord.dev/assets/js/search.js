window.addEventListener('DOMContentLoaded', (event) => {
  new PagefindUI({ element: "#search", showSubResults: true, pageSize: 2, baseUrl: "/docs", showImages: false });
});