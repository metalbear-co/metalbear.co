// This code iterates all links from the header
// and adds a click event listener that when clicked on the same page as the anchor
// it will add listen to the off canvas being closed and then scroll to the anchor
var links = document.querySelectorAll(".offcanvas-body .nav-item-non-children .nav-link");
links.forEach(function (link) {
    link.addEventListener("click", function (e) {
        if ((this.pathname === window.location.pathname) && (this.host === window.location.host)) {
            var target = document.getElementById(this.getAttribute("href").split("#")[1]);
            e.preventDefault();
            let offCanvas = document.getElementById("offcanvasDoks");
            // Distinguish between the offcanvas being open or closed
            if (offCanvas.classList.contains("show")) {
                offCanvas.addEventListener('hidden.bs.offcanvas', function () {
                    target.scrollIntoView();
                })
                document.getElementById("menuDismissButton").click();
            } else {
                target.scrollIntoView();
            }
        }
    });
});
