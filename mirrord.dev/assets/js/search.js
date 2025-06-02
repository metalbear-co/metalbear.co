window.addEventListener('DOMContentLoaded', (event) => {
    const searchElement = document.getElementById('search');
    if (searchElement) {
        new PagefindUI({
            element: '#search',
            showSubResults: true,
            pageSize: 5,
            baseUrl: '/mirrord/',
            showImages: false,
            processTerm: function(term) {
                return term.replace(/#.*$/, '');
            }
        });
    }
});
