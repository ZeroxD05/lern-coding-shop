const cart = [];
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

// Öffnen / Schließen Warenkorb
cartBtn.onclick = () => {
  cartSidebar.classList.add("open");
  overlay.classList.add("active");
  initPayPalButton(); // PayPal Buttons laden, wenn Warenkorb geöffnet wird
};

closeCart.onclick = () => {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("active");
};

overlay.onclick = () => {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("active");
};

// Produkt in den Warenkorb legen
addToCartBtns.forEach((btn) => {
  btn.onclick = function () {
    const card = btn.closest(".product-card");
    const id = card.dataset.id;
    const title = card.dataset.title;
    const price = parseFloat(card.dataset.price);

    const existing = cart.find((item) => item.id === id);
    if (!existing) {
      cart.push({ id, title, price, qty: 1 });
    } else {
      existing.qty += 1; // Falls du doch mal mehrere erlauben willst
    }

    updateCart();
    cartSidebar.classList.add("open");
    overlay.classList.add("active");
  };
});

// ────────────────────────────────────────────────
// Local Storage Funktionen
// ────────────────────────────────────────────────
function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) {
        cart.length = 0;
        cart.push(...arr);
      }
    } catch (e) {
      console.warn("Fehler beim Laden des Warenkorbs aus localStorage", e);
    }
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ────────────────────────────────────────────────
// Warenkorb UI aktualisieren
// ────────────────────────────────────────────────
function updateCart() {
  cartItems.innerHTML = "";
  cartCount.textContent = `(${cart.reduce((sum, item) => sum + item.qty, 0)})`;
  saveCart();

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    return;
  }

  let total = 0;
  const table = document.createElement("table");
  table.style.width = "100%";
  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;">Produkt</th>
        <th style="text-align:center;">Menge</th>
        <th style="text-align:right;">Preis</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  function formatPrice(val) {
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace(".", ",");
  }

  cart.forEach((item) => {
    total += item.price * item.qty;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.title}</td>
      <td style="text-align:center;">${item.qty}</td>
      <td style="text-align:right;">${formatPrice(item.price * item.qty)} €</td>
      <td style="vertical-align:middle;">
        <button class="remove-cart-item" data-id="${item.id}">✖</button>
      </td>
    `;
    table.querySelector("tbody").appendChild(row);
  });

  cartItems.appendChild(table);

  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-total-info";
  totalDiv.innerHTML = `
    <div class="cart-total" style="margin-top:16px; font-weight:bold; font-size:1.1rem;">
      Gesamt: ${formatPrice(total)} €
    </div>
    <div class="cart-legal" style="font-size:0.85rem; color:#666; margin-top:4px;">
      Alle Preise inkl. gesetzl. MwSt.
    </div>
  `;
  cartItems.appendChild(totalDiv);

  // Entfernen-Buttons
  document.querySelectorAll(".remove-cart-item").forEach((btn) => {
    btn.onclick = function () {
      const id = btn.dataset.id;
      const idx = cart.findIndex((item) => item.id === id);
      if (idx > -1) {
        cart.splice(idx, 1);
        updateCart();
      }
    };
  });
}

// ────────────────────────────────────────────────
// PayPal Smart Buttons
// ────────────────────────────────────────────────
let paypalButtonsInitialized = false;

function initPayPalButton() {
  if (paypalButtonsInitialized) return;
  if (typeof paypal === "undefined") {
    console.warn("PayPal SDK noch nicht geladen – warte auf Script");
    return;
  }

  paypal
    .Buttons({
      style: {
        shape: "rect",
        color: "blue",
        layout: "vertical",
        label: "paypal",
        height: 48,
        tagline: false,
      },

      createOrder: function (data, actions) {
        if (cart.length === 0) {
          alert("Warenkorb ist leer!");
          return;
        }

        const total = cart
          .reduce((sum, item) => sum + item.price * item.qty, 0)
          .toFixed(2);

        const items = cart.map((item) => ({
          name: item.title,
          unit_amount: { value: item.price.toFixed(2), currency_code: "EUR" },
          quantity: item.qty.toString(),
        }));

        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: "EUR",
                value: total,
                breakdown: {
                  item_total: { value: total, currency_code: "EUR" },
                },
              },
              items: items,
            },
          ],
          application_context: {
            shipping_preference: "NO_SHIPPING", // Digitale Produkte
            brand_name: "LernCoding",
            locale: "de-DE",
            user_action: "PAY_NOW",
          },
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (orderData) {
          alert(
            "Vielen Dank! Deine Zahlung war erfolgreich.\nBestellnummer: " +
              orderData.id,
          );

          // Warenkorb leeren
          cart.length = 0;
          updateCart();

          // Warenkorb schließen
          cartSidebar.classList.remove("open");
          overlay.classList.remove("active");

          // Optional: Weiterleitung zu Dankesseite
          // window.location.href = "/danke?order=" + orderData.id;
        });
      },

      onError: function (err) {
        console.error("PayPal Fehler:", err);
        alert(
          "Leider ist ein Fehler bei der Zahlung aufgetreten.\nBitte versuche es erneut oder kontaktiere uns.",
        );
      },

      onCancel: function () {
        // Optional: Hinweis bei Abbruch
        // alert("Zahlung abgebrochen.");
      },
    })
    .render("#paypal-button-container");

  paypalButtonsInitialized = true;
}

// ────────────────────────────────────────────────
// Restliche Features (Produkt-Dots, FAQ, Back-to-Top, Header Scroll)
// ────────────────────────────────────────────────

const productScroll = document.getElementById("productScroll");
const productDotsWrap = document.getElementById("productDots");
const productDots = productDotsWrap?.children;

if (window.innerWidth < 1024 && productDots) {
  productScroll.addEventListener("scroll", () => {
    const scrollPos = productScroll.scrollLeft;
    const cardWidth = productScroll.children[0].offsetWidth + 16; // gap berücksichtigen
    const index = Math.round(scrollPos / cardWidth);
    for (let i = 0; i < productDots.length; i++) {
      productDots[i].classList.remove("active");
    }
    productDots[index]?.classList.add("active");
  });
} else if (productDotsWrap) {
  productDotsWrap.style.display = "none";
}

// FAQ Akkordeon
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", function () {
    const item = btn.closest(".faq-item");
    item.classList.toggle("active");
  });
});

// Back-to-top (Mobile)
const backToTop = document.getElementById("backToTop");

function toggleBackToTop() {
  if (!backToTop) return;
  const isMobile = window.innerWidth <= 768;
  if (isMobile && window.scrollY > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
}

window.addEventListener("scroll", toggleBackToTop);
window.addEventListener("resize", toggleBackToTop);
document.addEventListener("DOMContentLoaded", toggleBackToTop);

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Header Scroll-Effekt
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateCart();
  toggleBackToTop();

  // Optional: PayPal schon beim Laden initialisieren (wenn du willst)
  // initPayPalButton();
});
