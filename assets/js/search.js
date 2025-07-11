window.addEventListener('DOMContentLoaded', (event) => {
    const searchElement = document.getElementById('search');
    if (searchElement) {
        new PagefindUI({
            element: '#search',
            showSubResults: true,
            pageSize: 5,
            baseUrl: '/mirrord/docs',
            showImages: false,
        });
    }
});
