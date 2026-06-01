const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
  navMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navMenu.classList.remove("open"));
  });
}

(function setupCountdown() {
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const end = Date.now() + 5 * 3600000 + 47 * 60000 + 33000;

  function update() {
    const diff = end - Date.now();

    if (diff <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    hoursEl.textContent = String(Math.floor(diff / 3600000)).padStart(2, "0");
    minutesEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    secondsEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    setTimeout(update, 1000);
  }

  update();
})();

// ── Live count hook ──
(function liveCountHook() {
  const el = document.getElementById("liveCount");
  if (!el) return;

  function update() {
    const base = 18 + Math.floor(Math.random() * 25); // 18–42
    el.textContent = base;
    setTimeout(update, 3000 + Math.random() * 5000); // every 3–8 sec
  }

  setTimeout(update, 4000);
})();

window.addEventListener("DOMContentLoaded", () => {
  const formTop = document.getElementById("formTop");
  if (formTop) {
    formTop.scrollIntoView({ behavior: "auto", block: "start" });
  }
});

const stickyCta = document.getElementById("stickyCta");
const orderSection = document.getElementById("order");

if (stickyCta && orderSection && "IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      stickyCta.style.display = entries[0].isIntersecting ? "none" : "";
    },
    { threshold: 0.1 }
  ).observe(orderSection);
}

const mobileInput = document.getElementById("mobile");
if (mobileInput) {
  mobileInput.addEventListener("input", function onInput() {
    this.value = this.value.replace(/\D/g, "");
  });
}

const form = document.getElementById("orderForm");
const API_URL = "https://backend-triven-crm.vercel.app/api/v1/leads/submit";

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = "";
}

function validate() {
  let valid = true;

  const nameEl = document.getElementById("fullName");
  const mobileEl = document.getElementById("mobile");
  const durationEl = document.getElementById("duration");

  if (!nameEl || !mobileEl || !durationEl) return false;

  const name = nameEl.value.trim();
  if (!name) {
    showError("nameError", "Name is required.");
    valid = false;
  } else if (name.length < 2) {
    showError("nameError", "Enter at least 2 characters.");
    valid = false;
  } else {
    clearError("nameError");
  }

  const mobile = mobileEl.value.trim();
  if (!mobile) {
    showError("mobileError", "Mobile number is required.");
    valid = false;
  } else if (!/^\d{10}$/.test(mobile)) {
    showError("mobileError", "Enter a valid 10-digit mobile number.");
    valid = false;
  } else {
    clearError("mobileError");
  }

  const duration = durationEl.value.trim();
  if (!duration) {
    showError("durationError", "Please enter problem duration.");
    valid = false;
  } else {
    clearError("durationError");
  }

  return valid;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fullName = (document.getElementById("fullName")?.value || "").trim();
    const mobile = (document.getElementById("mobile")?.value || "").trim();
    const duration = (document.getElementById("duration")?.value || "").trim();
    const symptoms = Array.from(
      document.querySelectorAll('input[name="symptoms"]:checked'),
      (el) => el.value
    );
    const symptomsText = symptoms.join(", ") || "Not specified";

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = form.querySelector('button[type="submit"] span');
    const oldText = btnText ? btnText.textContent : "";

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Submitting...";

    try {
      const payload = {
        name: fullName,
        phone: mobile,
        problemDuration: duration,
        symptoms: symptomsText
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let serverMessage = "";
        try {
          const errorData = await response.json();
          serverMessage = errorData?.message || "";
        } catch (_) {
          serverMessage = "";
        }
        throw new Error(serverMessage || `Submit failed with status ${response.status}`);
      }

      window.location.href = "thankyou.html";
    } catch (error) {
      console.error("Lead submit error:", error);
      alert(error?.message || "Form submit failed. Please try again.");
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = oldText || "Submit";
    }
  });
}

const revealEls = document.querySelectorAll(".symptom-card, .why-card, .review-card, .plan-steps li");

if (revealEls.length && "IntersectionObserver" in window) {
  const ro = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        ro.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  revealEls.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = `opacity 0.45s ease ${i * 0.04}s, transform 0.45s ease ${i * 0.04}s`;
    ro.observe(el);
  });
}
