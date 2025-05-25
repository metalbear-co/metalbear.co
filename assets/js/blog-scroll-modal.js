/**
 * Blog Scroll Modal
 * Displays a modal when the user scrolls 60% of the blog page
 * Can be enabled/disabled via front matter using "showScrollModal: true/false"
 */
function blogScrollModal() {
  return {
    showModal: false,
    hasSeenModal: false,
    scrollThreshold: 0.6, // 60% of page height
    
    init() {
      // Check if modal is enabled for this page
      const modalEnabled = document.body.dataset.showScrollModal === 'true';
      
      // If modal is disabled for this page, exit early
      if (!modalEnabled) {
        return;
      }
      
      // Check if user has seen the modal recently (within last 7 days)
      this.hasSeenModal = this.checkIfModalSeen();
      
      if (!this.hasSeenModal) {
        // Add scroll event listener
        window.addEventListener('scroll', this.handleScroll.bind(this));
      }
    },
    
    handleScroll() {
      if (this.showModal || this.hasSeenModal) {
        return;
      }
      
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollPercent = scrollTop / scrollHeight;
      
      // Show modal when scroll reaches 60% of page
      if (scrollPercent >= this.scrollThreshold) {
        this.showModal = true;
        // Remove event listener once modal is shown
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        // Record that user has seen the modal
        this.recordModalSeen();
      }
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    recordModalSeen() {
      // Store in localStorage with expiry of 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      const modalData = {
        seen: true,
        expires: expiryDate.getTime()
      };
      
      localStorage.setItem('blog-scroll-modal-seen', JSON.stringify(modalData));
    },
    
    checkIfModalSeen() {
      const modalData = localStorage.getItem('blog-scroll-modal-seen');
      
      if (!modalData) {
        return false;
      }
      
      try {
        const data = JSON.parse(modalData);
        const now = new Date().getTime();
        
        // If data is expired, clear it and return false
        if (now > data.expires) {
          localStorage.removeItem('blog-scroll-modal-seen');
          return false;
        }
        
        return data.seen;
      } catch (e) {
        return false;
      }
    }
  };
}
