/*
 * Custom JavaScript to recreate interactive functionality for the SoFresh
 * Packaging landing page. This script provides basic behaviour such as
 * sticky header styling, mobile navigation toggling, scroll-to-top button,
 * smooth scrolling to page sections, modal pop-ups for contact/inquiry
 * forms, simple language switching and form submission hooks.
 *
 * This implementation does not depend on the original proprietary scripts
 * and can be adapted to your existing HTML markup by ensuring that
 * the selectors used below match elements in your document. If you need
 * different selectors, adjust the query selectors accordingly.
 */

document.addEventListener('DOMContentLoaded', function () {
  /**
   * Sticky header and scrolled class
   * Adds a `.scrolled` class to the `<body>` when the page is scrolled
   * beyond 100px. You can target this class in CSS to adjust the header
   * appearance (e.g. change background colour or shadow).
   */
  const bodyEl = document.body;
  function toggleScrolled() {
    if (window.scrollY > 100) {
      bodyEl.classList.add('scrolled');
    } else {
      bodyEl.classList.remove('scrolled');
    }
  }
  toggleScrolled();
  document.addEventListener('scroll', toggleScrolled);

  /**
   * Mobile navigation toggle
   * Assumes there is a button with class `.nav-toggle` that toggles the
   * visibility of a menu container with id `#navmenu`. When a nav link is
   * clicked on small screens, the menu will close automatically.
   */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navmenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          navMenu.classList.remove('active');
        }
      });
    });
  }

  /**
   * Scroll-to-top button
   * Shows a button with class `.scroll-top` when scrolled down. Clicking
   * the button smoothly scrolls to the top of the page.
   */
  const scrollTopBtn = document.querySelector('.scroll-top');
  function toggleScrollTop() {
    if (scrollTopBtn) {
      if (window.scrollY > 100) {
        scrollTopBtn.classList.add('active');
      } else {
        scrollTopBtn.classList.remove('active');
      }
    }
  }
  toggleScrollTop();
  document.addEventListener('scroll', toggleScrollTop);
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Smooth scroll for anchor links
   * This will intercept clicks on links starting with `#` and smoothly
   * scroll to the referenced element. You can disable default anchor
   * behaviour on specific links by adding the `data-no-smooth` attribute.
   */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || this.hasAttribute('data-no-smooth')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const scrollMargin = parseInt(getComputedStyle(targetEl).scrollMarginTop) || 0;
        const targetPos = targetEl.offsetTop - scrollMargin;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  /**
   * Modal pop-up helper
   * Provide a reusable way to open and close a modal dialogue. Assumes
   * modals are simple divs with class `.modal` and have a child element
   * with class `.modal-close` to close them. To open a modal, attach
   * `data-modal-target="#modalId"` to any trigger element.
   */
  function openModal(modal) {
    if (modal) {
      modal.classList.add('open');
      modal.addEventListener('click', outsideClickListener);
    }
  }
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('open');
      modal.removeEventListener('click', outsideClickListener);
    }
  }
  function outsideClickListener(e) {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  }
  // Bind triggers
  document.querySelectorAll('[data-modal-target]').forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const selector = this.getAttribute('data-modal-target');
      const modal = document.querySelector(selector);
      openModal(modal);
    });
  });
  // Bind close buttons
  document.querySelectorAll('.modal .modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function () {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });

  /**
   * Form submission via EmailJS
   * If you wish to send form data to an email, configure your EmailJS
   * service ID, template ID and public key below. Replace the placeholders
   * with your own values from EmailJS. If you do not wish to use EmailJS,
   * you can replace this with a simple fetch request to your own API or
   * remove the logic entirely.
   */
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Example: Show a loading indicator or disable the submit button
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Check if the consent checkbox is ticked. If not, alert user and prevent submission
      const consentCheckbox = document.getElementById('consent-checkbox');
      if (consentCheckbox && !consentCheckbox.checked) {
        // Determine current language for appropriate alert message
        const selectedLang = localStorage.getItem('selectedLang') || 'en';
        if (selectedLang === 'th') {
          alert('กรุณายอมรับเงื่อนไขความเป็นส่วนตัวก่อนส่งข้อมูล');
        } else {
          alert('Please accept the privacy policy consent before submitting the form.');
        }
        // Re-enable submit button and abort submission
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // Initialize EmailJS (requires inclusion of EmailJS SDK script in HTML)
      // Replace with your own public key
      // Replace placeholders with real EmailJS credentials
      const EMAILJS_PUBLIC_KEY = 'OOmUUbHLUleNsMDvI';
      const SERVICE_ID = 'service_ra5gop8';
      const TEMPLATE_ID = 'template_si8sy0g';
      // Ensure emailjs library is available
      if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, inquiryForm)
          .then(() => {
            alert('ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณค่ะ');
            inquiryForm.reset();
            const modal = inquiryForm.closest('.modal');
            if (modal) closeModal(modal);
          })
          .catch(err => {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการส่ง กรุณาลองใหม่');
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
          });
      } else {
        // If EmailJS is not loaded, show success message without sending
        alert('แบบฟอร์มถูกส่ง (Demo mode)');
        inquiryForm.reset();
        const modal = inquiryForm.closest('.modal');
        if (modal) closeModal(modal);
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /**
   * Language toggle
   * To enable multi-language content, mark elements with `.lang-en` and
   * `.lang-th` classes. Buttons or links with id `lang-en`/`lang-th` can
   * trigger the display of the respective language. Selected language is
   * stored in localStorage.
   */
  function setLang(lang) {
    document.querySelectorAll('.lang-en').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.lang-th').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.lang-' + lang).forEach(el => el.style.display = '');
    localStorage.setItem('selectedLang', lang);
  }
  const savedLang = localStorage.getItem('selectedLang') || 'en';
  setLang(savedLang);
  // Attach toggle handler for language switch
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    // Set initial state based on stored language
    langToggle.checked = savedLang === 'en';
    langToggle.addEventListener('change', () => {
      if (langToggle.checked) {
        setLang('en');
      } else {
        setLang('th');
      }
    });
  }

  /**
   * Preloader (optional)
   * If your HTML includes a `#preloader` element that should disappear
   * once the page has loaded, this will remove it after the `load` event.
   */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }
});