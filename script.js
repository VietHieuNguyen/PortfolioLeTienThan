document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupActiveNav();
  setupExperienceProofToggle();
  setupContactForm();
  setupScrollReveal();
  setupBackToTop();
});

/* ===== MOBILE MENU ===== */
function setupMobileMenu() {
  const header = document.querySelector(".header");
  const toggle = header?.querySelector(".menu-toggle");
  const nav = header?.querySelector(".nav");

  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Mở menu điều hướng");
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ===== CONTACT FORM ===== */
function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  const submitBtn = document.querySelector("#submit-btn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnLoading = submitBtn?.querySelector(".btn-loading");
  const overlay = document.querySelector("#form-overlay");
  const toast = document.querySelector("#toast-notification");
  const toastClose = document.querySelector("#toast-close");
  const urlField = form.querySelector('input[name="_url"]');
  const nextField = form.querySelector('input[name="_next"]');

  // Set dynamic URLs
  if (urlField) urlField.value = window.location.href;
  if (nextField) nextField.value = window.location.href;

  // Toast close handler
  if (toastClose) {
    toastClose.addEventListener("click", () => {
      toast.classList.remove("show");
    });
  }

  // Inline validation
  form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
    field.addEventListener("blur", () => {
      if (!field.value.trim()) {
        field.classList.add("field-error");
      } else {
        field.classList.remove("field-error");
      }
    });
    field.addEventListener("input", () => {
      if (field.value.trim()) {
        field.classList.remove("field-error");
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Check all required fields
    let hasErrors = false;
    form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("field-error");
        hasErrors = true;
      }
    });

    if (hasErrors || !form.reportValidity()) return;

    const action = form.getAttribute("action") || "";
    const endpoint = action.includes("/ajax/") ? action : action.replace("formsubmit.co/", "formsubmit.co/ajax/");

    // Show loading state
    setStatus("", "");
    if (overlay) overlay.classList.add("show");
    if (btnText) btnText.style.display = "none";
    if (btnLoading) btnLoading.style.display = "inline";
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Request failed");

      form.reset();
      if (urlField) urlField.value = window.location.href;
      if (nextField) nextField.value = window.location.href;

      // Show success toast
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 6000);
      }

      setStatus(
        "✓ Tin nhắn đã được gửi thành công!",
        "success"
      );

      // Scroll to status
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      setStatus(
        "Chưa gửi được lúc này. Bạn có thể thử lại hoặc gửi trực tiếp tới lethan0811@gmail.com.",
        "error"
      );
      // Shake the form
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 600);
    } finally {
      if (overlay) overlay.classList.remove("show");
      if (btnText) btnText.style.display = "inline";
      if (btnLoading) btnLoading.style.display = "none";
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }
}

/* ===== SCROLL REVEAL ===== */
function setupScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ===== BACK TO TOP ===== */
function setupBackToTop() {
  const btn = document.querySelector("#back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===== ACTIVE NAV & SCROLLSPY ===== */
function setupActiveNav() {
  const nav = document.querySelector(".header .nav");
  if (!nav) return;

  const navLinks = Array.from(nav.querySelectorAll("a"));
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const isAboutPage = currentPath.includes("about");
  const isIndexPage = currentPath.includes("index") || currentPath === "" || currentPath === "/";

  const setActiveLink = (targetLink) => {
    if (!targetLink) return;
    navLinks.forEach((link) => link.classList.remove("active"));
    targetLink.classList.add("active");
  };

  const findLinkByHash = (hash) => {
    if (!hash) return null;
    return navLinks.find((link) => {
      const href = link.getAttribute("href") || "";
      return href === hash || href.endsWith(hash);
    });
  };

  const getDefaultLink = () => {
    if (isAboutPage) {
      return navLinks.find((link) => link.getAttribute("href") === "about.html");
    }
    if (isIndexPage) {
      return navLinks.find((link) => link.getAttribute("href") === "index.html");
    }
    return navLinks.find((link) => link.getAttribute("href") === currentPath);
  };

  const updateActiveFromHash = () => {
    const hash = window.location.hash;
    if (hash) {
      const match = findLinkByHash(hash);
      if (match) {
        setActiveLink(match);
        return true;
      }
    }
    return false;
  };

  // Initial check on page load
  if (!updateActiveFromHash()) {
    const defaultLink = getDefaultLink();
    if (defaultLink && !nav.querySelector("a.active")) {
      setActiveLink(defaultLink);
    }
  }

  // Click handler on navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href") || "";

      if (href === "about.html" && isAboutPage) {
        if (window.location.hash) {
          history.pushState("", document.title, window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveLink(this);
        e.preventDefault();
      } else if (href === "index.html" && isIndexPage) {
        if (window.location.hash) {
          history.pushState("", document.title, window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveLink(this);
        e.preventDefault();
      } else if (href.startsWith("#")) {
        setActiveLink(this);
      } else if (href.includes("#")) {
        const [page, hash] = href.split("#");
        if ((page === "index.html" && isIndexPage) || (page === "about.html" && isAboutPage)) {
          setActiveLink(this);
        }
      }
    });
  });

  window.addEventListener("hashchange", updateActiveFromHash);

  // ScrollSpy for sections on the current page
  const sectionsToCheck = [];
  const expSection = document.getElementById("experience");
  const projSection = document.getElementById("projects");

  // On index page: Experience is above Projects
  if (expSection) sectionsToCheck.push({ id: "experience", el: expSection });
  if (projSection) sectionsToCheck.push({ id: "projects", el: projSection });

  if (sectionsToCheck.length > 0) {
    let isClickScrolling = false;

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        isClickScrolling = true;
        setTimeout(() => {
          isClickScrolling = false;
        }, 900);
      });
    });

    window.addEventListener(
      "scroll",
      () => {
        if (isClickScrolling) return;

        const scrollPos = window.scrollY + 220;

        // If user scrolls back near the top
        if (window.scrollY < 200) {
          const defaultLink = getDefaultLink();
          if (defaultLink) setActiveLink(defaultLink);
          return;
        }

        for (let i = sectionsToCheck.length - 1; i >= 0; i--) {
          const { id, el } = sectionsToCheck[i];
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            const matched = findLinkByHash("#" + id);
            if (matched) setActiveLink(matched);
            break;
          }
        }
      },
      { passive: true }
    );
  }
}

/* ===== EXPERIENCE PROOF TOGGLE ===== */
function setupExperienceProofToggle() {
  const toggleButtons = document.querySelectorAll(".experience-proof-toggle");
  if (!toggleButtons.length) return;

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".experience-card");
      if (!card) return;

      const wrapper = card.querySelector(".experience-proof-wrapper");
      if (!wrapper) return;

      const isExpanded = this.classList.toggle("active");
      wrapper.classList.toggle("show");
      this.setAttribute("aria-expanded", String(isExpanded));

      if (isExpanded) {
        this.innerHTML = '<i class="fa-regular fa-eye-slash"></i> Thu gọn <i class="fa-solid fa-chevron-down"></i>';
      } else {
        this.innerHTML = '<i class="fa-regular fa-eye"></i> Xem chi tiết <i class="fa-solid fa-chevron-down"></i>';
      }
    });
  });
}
