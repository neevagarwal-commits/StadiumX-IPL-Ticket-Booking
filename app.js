
/* =========================================
   STADIUMX - JAVASCRIPT
   ACTIVITY 5 + BOOKING SYSTEM
========================================= */

const STORAGE_KEY = "stadiumXBookings";

const ticketPrices = {
    "RCB vs CSK": { General: 800, Premium: 2000, VIP: 5000 },
    "MI vs KKR": { General: 1000, Premium: 2500, VIP: 6000 },
    "CSK vs SRH": { General: 700, Premium: 1800, VIP: 4500 }
};

// 1. Reusable toast notification
function showToast(message) {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

// 2. Smooth scrolling
function scrollToBooking() {
    const section = document.getElementById("booking");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        showToast("Redirecting to the booking section!");
    }
}

// 3. Read saved bookings
function getBookings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

// 4. Save bookings
function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

// 5. Calculate ticket price
function getTicketPrice(match, stand) {
    return ticketPrices[match]?.[stand] || 0;
}

// 6. Update booking summary
function updateSummary(form) {
    const match = form.elements.match.value;
    const stand = form.elements.stand.value;
    const quantity = Number(form.elements.quantity.value) || 0;

    const price = getTicketPrice(match, stand);
    const total = price * quantity;

    const values = {
        summaryMatch: match || "Not Selected",
        summaryStand: stand || "Not Selected",
        summaryPrice: price,
        summaryQuantity: quantity,
        summaryTotal: total
    };

    Object.entries(values).forEach(function ([id, value]) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// 7. Display bookings on home page
function displayBookings() {
    const list = document.getElementById("bookingsList");
    const emptyMessage = document.getElementById("noBookings");

    if (!list) return;

    const bookings = getBookings();
    list.replaceChildren();

    bookings.forEach(function (booking) {
        const row = document.createElement("tr");

        [
            booking.id,
            booking.name,
            booking.match,
            booking.stand,
            booking.quantity,
            "₹" + booking.total
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", function () {
            cancelBooking(booking.id);
        });

        actionCell.appendChild(cancelButton);
        row.appendChild(actionCell);
        list.appendChild(row);
    });

    if (emptyMessage) {
        emptyMessage.style.display =
            bookings.length === 0 ? "block" : "none";
    }
}

// 8. Cancel booking
function cancelBooking(id) {
    const bookings = getBookings();
    const updated = bookings.filter(function (booking) {
        return booking.id !== id;
    });

    saveBookings(updated);
    displayBookings();
    showToast("Booking cancelled successfully.");
}

// 9. Handle form submission
function handleBooking(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const match = data.get("match");
    const stand = data.get("stand");
    const quantity = Number(data.get("quantity"));
    const preference = data.get("preference");

    const price = getTicketPrice(match, stand);

    if (!name || !email || !/^[0-9]{10}$/.test(phone) ||
        !Number.isInteger(quantity) || quantity < 1 ||
        quantity > 10 || !price || !preference) {
        showToast("Please enter valid booking details.");
        return;
    }

    const booking = {
        id: "STX-" + Date.now(),
        name: name,
        email: email,
        phone: phone,
        match: match,
        stand: stand,
        quantity: quantity,
        preference: preference,
        price: price,
        total: price * quantity,
        date: new Date().toLocaleString()
    };

    try {
        const bookings = getBookings();
        bookings.push(booking);
        saveBookings(bookings);
    } catch (error) {
        showToast("Unable to save booking. Check browser storage.");
        return;
    }

    const confirmation = document.getElementById("bookingConfirmation");

    if (confirmation) {
        confirmation.textContent =
            "BOOKING CONFIRMED! Booking ID: " + booking.id +
            " | Match: " + booking.match +
            " | Tickets: " + booking.quantity +
            " | Total: ₹" + booking.total;

        confirmation.classList.add("show-confirmation");
    }

    displayBookings();
    showToast("Your booking has been confirmed!");

    form.reset();

    if (document.getElementById("summaryMatch")) {
        updateSummary(form);
    }
}

// 10. Initialize website
document.addEventListener("DOMContentLoaded", function () {

    // Smooth scrolling for Book links
    document.querySelectorAll('a[href="#booking"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            if (document.getElementById("booking")) {
                event.preventDefault();

                const match = link.dataset.match;
                const matchSelect = document.getElementById("match");

                if (match && matchSelect) {
                    matchSelect.value = match;
                }

                scrollToBooking();

                const form = document.getElementById("bookingForm");
                if (form) updateSummary(form);
            }
        });
    });

    // Team filter
    const teamFilter = document.getElementById("teamFilter");

    if (teamFilter) {
        teamFilter.addEventListener("change", function () {
            const selected = teamFilter.value;

            document.querySelectorAll("#matchTable tbody tr").forEach(function (row) {
                const teams = row.dataset.teams || "";

                row.style.display =
                    selected === "all" || teams.split(" ").includes(selected)
                        ? ""
                        : "none";
            });
        });
    }

    // Booking form
    const form = document.getElementById("bookingForm");

    if (form) {
        form.addEventListener("submit", handleBooking);

        ["match", "stand", "quantity"].forEach(function (field) {
            const input = form.elements[field];

            input.addEventListener("change", function () {
                updateSummary(form);
            });

            input.addEventListener("input", function () {
                updateSummary(form);
            });
        });

        form.addEventListener("reset", function () {
            setTimeout(function () {
                updateSummary(form);

                const confirmation =
                    document.getElementById("bookingConfirmation");

                if (confirmation) {
                    confirmation.textContent = "";
                    confirmation.classList.remove("show-confirmation");
                }
            }, 0);
        });

        updateSummary(form);
    }

    // Load saved bookings
    displayBookings();
});
