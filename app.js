
/* =========================================
   STADIUMX - ACTIVITY 8
   JAVASCRIPT AND RESPONSIVE INTERACTION
========================================= */

const STORAGE_KEY = "stadiumXBookings";

const ticketPrices = {
    "RCB vs CSK": {
        General: 800,
        Premium: 2000,
        VIP: 5000
    },
    "MI vs KKR": {
        General: 1000,
        Premium: 2500,
        VIP: 6000
    },
    "CSK vs SRH": {
        General: 700,
        Premium: 1800,
        VIP: 4500
    }
};

/* 1. TOAST NOTIFICATION */

let toastTimer;

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* 2. SMOOTH SCROLLING */

function scrollToBooking() {
    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}

/* 3. LOCAL STORAGE */

function getBookings() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

/* 4. GET TICKET PRICE */

function getTicketPrice(match, stand) {
    if (ticketPrices[match] && ticketPrices[match][stand]) {
        return ticketPrices[match][stand];
    }

    return 0;
}

/* 5. LIVE BOOKING SUMMARY */

function updateSummary(showNotification = false) {
    const match = document.getElementById("match").value;
    const stand = document.getElementById("stand").value;

    const quantity = Math.max(
        0,
        Math.min(10, Number(document.getElementById("quantity").value) || 0)
    );

    const price = getTicketPrice(match, stand);
    const total = price * quantity;

    document.getElementById("summaryMatch").textContent =
        match || "Not Selected";

    document.getElementById("summaryStand").textContent =
        stand || "Not Selected";

    document.getElementById("summaryPrice").textContent =
        price.toLocaleString("en-IN");

    document.getElementById("summaryQuantity").textContent =
        quantity;

    document.getElementById("summaryTotal").textContent =
        total.toLocaleString("en-IN");

    if (showNotification) {
        showToast("Booking summary updated successfully!");
    }
}

/* 6. DISPLAY BOOKINGS */

function displayBookings() {
    const bookingsList = document.getElementById("bookingsList");
    const noBookings = document.getElementById("noBookings");

    const bookings = getBookings();

    bookingsList.innerHTML = "";

    noBookings.style.display =
        bookings.length === 0 ? "block" : "none";

    bookings.forEach((booking) => {
        const row = document.createElement("tr");

        const bookingId = booking.id || booking.bookingId || "N/A";

        const values = [
            bookingId,
            booking.name || "",
            booking.match || "",
            booking.stand || "",
            booking.quantity || 0,
            "₹" + Number(booking.total || 0).toLocaleString("en-IN")
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.className = "cancel-button";
        cancelButton.textContent = "Cancel";

        cancelButton.addEventListener("click", () => {
            cancelBooking(bookingId);
        });

        actionCell.appendChild(cancelButton);
        row.appendChild(actionCell);

        bookingsList.appendChild(row);
    });
}

/* 7. CANCEL BOOKING */

function cancelBooking(bookingId) {
    const bookings = getBookings();

    const updatedBookings = bookings.filter((booking) => {
        return (booking.id || booking.bookingId) !== bookingId;
    });

    saveBookings(updatedBookings);
    displayBookings();

    showToast("Booking cancelled successfully!");
}

/* 8. CONFIRM BOOKING */

function handleBooking(event) {
    event.preventDefault();

    const form = document.getElementById("bookingForm");

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const phone = form.elements.phone.value.trim();

    const match = form.elements.match.value;
    const stand = form.elements.stand.value;
    const quantity = Number(form.elements.quantity.value);

    const preference = form.querySelector(
        'input[name="preference"]:checked'
    );

    if (!name || !email || !phone || !match || !stand ||
        !preference || !form.elements.terms.checked) {
        showToast("Please complete all required fields.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        showToast("Please select between 1 and 10 tickets.");
        return;
    }

    const price = getTicketPrice(match, stand);
    const total = price * quantity;

    const booking = {
        id: "SX" + Date.now(),
        name: name,
        email: email,
        phone: phone,
        match: match,
        stand: stand,
        quantity: quantity,
        preference: preference.value,
        price: price,
        total: total
    };

    const bookings = getBookings();

    bookings.push(booking);
    saveBookings(bookings);

    const confirmation = document.getElementById("bookingConfirmation");

    confirmation.textContent =
        "Booking confirmed! Your Booking ID is " +
        booking.id +
        ". Total amount: ₹" +
        total.toLocaleString("en-IN") +
        ".";

    confirmation.classList.add("show-confirmation");

    displayBookings();

    showToast("Your ticket booking is confirmed!");

    form.reset();
    updateSummary(false);
}

/* 9. ACTIVITY 8 - TEAM FILTER */

function filterMatches() {
    const selectedTeam = document.getElementById("teamFilter").value;

    const matchCards = document.querySelectorAll(".match-card");
    const noMatches = document.getElementById("noMatches");

    let visibleCount = 0;

    matchCards.forEach((card) => {
        const teams = card.dataset.teams.split(" ");

        const shouldShow =
            selectedTeam === "all" || teams.includes(selectedTeam);

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
            visibleCount++;
        }
    });

    noMatches.hidden = visibleCount !== 0;
}

/* 10. ACTIVITY 8 - GRID AND LIST VIEW */

function setMatchView(view) {
    const container = document.getElementById("matchContainer");

    const gridButton = document.getElementById("gridViewBtn");
    const listButton = document.getElementById("listViewBtn");

    if (view === "list") {
        container.classList.add("list-view");

        listButton.classList.add("active");
        gridButton.classList.remove("active");

        showToast("List view activated!");
    } else {
        container.classList.remove("list-view");

        gridButton.classList.add("active");
        listButton.classList.remove("active");

        showToast("Grid view activated!");
    }
}

/* 11. ACTIVITY 8 - MOBILE HAMBURGER MENU */

function toggleMobileMenu() {
    const menu = document.getElementById("mainNav");
    const menuButton = document.getElementById("menuToggle");

    const isOpen = menu.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));

    menuButton.textContent = isOpen ? "✕" : "☰";
}

/* 12. INITIALIZE WEBSITE */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("bookingForm");

    /* Hamburger menu */
    const menuButton = document.getElementById("menuToggle");
    const navigation = document.getElementById("mainNav");

    menuButton.addEventListener("click", toggleMobileMenu);

    /* Close mobile menu after selecting a link */
    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "☰";
        });
    });

    /* Team filter */
    document.getElementById("teamFilter").addEventListener(
        "change",
        filterMatches
    );

    /* Grid view */
    document.getElementById("gridViewBtn").addEventListener(
        "click",
        () => setMatchView("grid")
    );

    /* List view */
    document.getElementById("listViewBtn").addEventListener(
        "click",
        () => setMatchView("list")
    );

    /* Book tickets buttons */
    document.querySelectorAll(".book-match-button").forEach((button) => {
        button.addEventListener("click", () => {
            form.elements.match.value = button.dataset.match;

            updateSummary(false);
            scrollToBooking();
        });
    });

    /* Live summary updates */
    form.elements.match.addEventListener("change", () => {
        updateSummary(true);
    });

    form.elements.stand.addEventListener("change", () => {
        updateSummary(true);
    });

    form.elements.quantity.addEventListener("input", () => {
        updateSummary(false);
    });

    form.elements.quantity.addEventListener("change", () => {
        updateSummary(true);
    });

    /* Booking form */
    form.addEventListener("submit", handleBooking);

    /* Reset form */
    form.addEventListener("reset", () => {
        setTimeout(() => {
            const confirmation =
                document.getElementById("bookingConfirmation");

            confirmation.classList.remove("show-confirmation");
            confirmation.textContent = "";

            updateSummary(false);
        }, 0);
    });

    /* Initial setup */
    updateSummary(false);
    filterMatches();
    displayBookings();

});
