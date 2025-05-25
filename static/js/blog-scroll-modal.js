/* CTA Modal for Blog Posts */

// Self-executing function to avoid global scope pollution
(function() {
  window.addEventListener('load', function() {
    // Only initialize if modal is explicitly enabled
    if (document.body.dataset.showScrollModal !== 'true') return;

    // Get the modal element
    const modal = document.getElementById('blog-scroll-modal');
    if (!modal) return;

    // Get threshold from data attribute or use default 0.6 (60%)
    const threshold = parseFloat(document.body.dataset.scrollThreshold || '0.6');
    
    // Track if modal has been shown in this session
    let modalShown = false;
    
    // Check if user has already seen this modal (localStorage)
    const modalData = localStorage.getItem('blog-scroll-modal-seen');
    if (modalData) {
      try {
        const data = JSON.parse(modalData);
        const now = new Date().getTime();
        
        // If data is not expired and this is the same page, don't show modal
        if (now < data.expires && data.url === window.location.pathname) {
          return;
        }
      } catch (e) {
        // Invalid data, continue normally
      }
    }

    // Close modal when close button is clicked
    document.addEventListener('click', function(event) {
      if (event.target.closest('.modal-close-btn')) {
        hideModal();
      }
    });

    // Close modal when clicking backdrop
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        hideModal();
      }
    });
    
    // Hide modal function
    function hideModal() {
      modal.style.opacity = '0';
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    
    // Show modal function - ONLY called from the scroll handler
    function showModal() {
      if (modalShown) return;
      
      modal.style.display = 'block';
      // Force browser reflow to ensure transition works
      modal.offsetHeight;
      modal.style.opacity = '1';
      
      // Track that modal has been shown
      modalShown = true;
      
      // Store in localStorage so it won't show again for 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      localStorage.setItem('blog-scroll-modal-seen', JSON.stringify({
        seen: true,
        expires: expiryDate.getTime(),
        url: window.location.pathname
      }));
      
      // Remove scroll listener since modal has been shown
      window.removeEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Performance optimization: Add throttling to scroll event
    let scrollTimeout = null;
    
    // Scroll event handler with throttling for performance
    function handleScroll() {
      if (modalShown) return;
      
      // Don't run the calculations on every scroll event (throttling)
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        // Calculate scroll percentage
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollPercent = scrollTop / scrollHeight;
        
        // Only show modal if user has scrolled past threshold
        if (scrollPercent >= threshold) {
          showModal();
        }
        
        scrollTimeout = null;
      }, 100); // Check every 100ms at most
    }
    
    // Setup modal styles
    modal.style.transition = 'opacity 0.3s ease-out';
    modal.style.opacity = '0';
    
    // Start listening for scroll events - ONLY way the modal will appear
    window.addEventListener('scroll', handleScroll, { passive: true });
  });
})();
