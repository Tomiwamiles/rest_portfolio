document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
    });
  }
  
  // Close alert messages
  const alertCloseButtons = document.querySelectorAll('.alert-close');
  
  alertCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const alert = button.closest('.alert');
      if (alert) {
        alert.style.opacity = '0';
        setTimeout(() => {
          alert.style.display = 'none';
        }, 300);
      }
    });
  });
  
  // Form validation
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    if (form.classList.contains('needs-validation')) {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        form.classList.add('was-validated');
      }, false);
    }
  });
  
  // File input preview
  const fileInputs = document.querySelectorAll('.custom-file-input');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', () => {
      const fileName = input.files[0]?.name;
      const label = input.nextElementSibling;
      
      if (label && fileName) {
        label.textContent = fileName;
      }
      
      // Image preview
      const previewContainer = input.closest('.form-group').querySelector('.image-preview');
      
      if (previewContainer && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = e => {
          previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview" class="img-preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
      }
    });
  });
  
  // Filter toggle
  const filterToggle = document.querySelector('.filter-toggle');
  const filterContent = document.querySelector('.filter-content');
  
  if (filterToggle && filterContent) {
    filterToggle.addEventListener('click', () => {
      filterContent.classList.toggle('show');
      
      // Change icon
      const icon = filterToggle.querySelector('i');
      if (icon) {
        if (filterContent.classList.contains('show')) {
          icon.classList.remove('fa-filter');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-filter');
        }
      }
    });
  }
  
  // Animate elements on scroll
  const fadeElements = document.querySelectorAll('.fade-in');
  
  if (fadeElements.length > 0) {
    const fadeInOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, fadeInOptions);
    
    fadeElements.forEach(element => {
      fadeInObserver.observe(element);
    });
  }
  
  // Location autocomplete (placeholder for future implementation)
  const locationInputs = document.querySelectorAll('input[name="location"]');
  
  if (locationInputs.length > 0) {
    // In a real implementation, this would integrate with a location API
    console.log('Location inputs found. Ready for autocomplete implementation.');
  }
  
  // Initialize ratings
  const ratingInputs = document.querySelectorAll('.rating-input');
  
  ratingInputs.forEach(container => {
    const stars = container.querySelectorAll('.rating-star');
    const input = container.querySelector('input[type="hidden"]');
    
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        const rating = index + 1;
        
        if (input) {
          input.value = rating;
        }
        
        // Update visual
        stars.forEach((s, i) => {
          if (i < rating) {
            s.classList.add('filled');
          } else {
            s.classList.remove('filled');
          }
        });
      });
    });
  });
  
  // Enhanced Search Form Functionality
  const searchForms = document.querySelectorAll('.search-form');
  
  searchForms.forEach(form => {
    const inputs = form.querySelectorAll('.search-input, .search-select');
    const searchInputGroups = form.querySelectorAll('.search-input-group');
    
    // Add focus styles to input groups
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.closest('.search-input-group').classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        if (!this.value) {
          this.closest('.search-input-group').classList.remove('focused');
        }
      });

      // Keep focus style if input has value
      if (input.value) {
        input.closest('.search-input-group').classList.add('focused');
      }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
      const term = form.querySelector('input[name="term"]')?.value.trim();
      const location = form.querySelector('input[name="location"]')?.value.trim();
      const category = form.querySelector('select[name="category"]')?.value;
      
      // Allow empty searches but show loading state
      const searchBtn = form.querySelector('.search-btn');
      if (searchBtn) {
        const originalContent = searchBtn.innerHTML;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
        
        // Reset button after a short delay (simulating search)
        setTimeout(() => {
          searchBtn.innerHTML = originalContent;
          searchBtn.disabled = false;
        }, 500);
      }
    });
  });
  
  // Initialize mobile menu toggle
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
  
  // Flash message auto-dismiss
  const flashMessages = document.querySelectorAll('.alert');
  flashMessages.forEach(message => {
    const closeBtn = message.querySelector('.alert-close, .btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        message.remove();
      });
    }
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      message.remove();
    }, 5000);
  });
}); 