
/* =========================================
   STADIUMX - JAVASCRIPT
   ACTIVITY 5 + ACTIVITY 7
   BOOKING SYSTEM + LIVE SUMMARY
========================================= */

const STORAGE_KEY = "stadiumXBookings";

// Ticket prices for each match and stand
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

// =========================================
// 1. REUSABLE TOAST NOTIFICATION
// =========================================

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

// =========================================
// 2. SMOOTH SCROLLING
// =========================================

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

// =========================================
// 3. GET SAVED BOOKINGS
// =========================================

function getBookings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {
        return [];
    }
}

// =========================================
// 4. SAVE BOOKINGS
// =========================================

function saveBookings(bookings) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(bookings)
    );
}

// =========================================
// 5. GET TICKET PRICE
// =========================================

function getTicketPrice(match, stand) {
    return ticketPrices[match]?.[stand] || 0;
}

// =========================================
// 6. ACTIVITY 7 - LIVE BOOKING SUMMARY
// =========================================

function updateSummary(showNotification = false) {

    // Select form controls using DOM selectors
    const matchSelect = document.getElementById("match");
    const standSelect = document.getElementById("stand");
    const quantityInput = document.getElementById("quantity");

    if (!matchSelect || !standSelect || !quantityInput) {
        return;
    }

    // Read the user's selections
    const selectedMatch = matchSelect.value;
    const selectedStand = standSelect.value;
    const quantity = Number(quantityInput.value) || 0;

    // Calculate ticket price and total amount
    const price = getTicketPrice(selectedMatch, selectedStand);
    const total = price * quantity;

    // Update Booking Summary Card
    document.getElementById("summaryMatch").textContent =
        selectedMatch || "Not Selected";

    document.getElementById("summaryStand").textContent =
        selectedStand || "Not Selected";

    document.getElementById("summaryPrice").textContent =
        price;

    document.getElementById("summaryQuantity").textContent =
        quantity;

    document.getElementById("summaryTotal").textContent =
        total;

    // Show toast when the user changes a selection
    if (showNotification) {
        showToast("Booking summary updated successfully!");
    }
}

// =========================================
// 7. DISPLAY SAVED BOOKINGS
// =========================================

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

// =========================================
// 8. CANCEL BOOKING
// =========================================

function cancelBooking(id) {

    const bookings = getBookings();

    const updatedBookings = bookings.filter(function (booking) {
        return booking.id !== id;
    });

    try {
        saveBookings(updatedBookings);
        displayBookings();
        showToast("Booking cancelled successfully!");

    } catch (error) {
        showToast("Unable to cancel booking.");
    }
}

// =========================================
// 9. HANDLE BOOKING FORM SUBMISSION
// =========================================

function handleBooking(event) {

    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
        return;
    }

    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    const match = data.get("match");
    const stand = data.get("stand");

    const quantity = Number(data.get("quantity"));
    const preference = data.get("preference");

    const price = getTicketPrice(match, stand);

    if (
        !name ||
        !email ||
        !/^[0-9]{10}$/.test(phone) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10 ||
        !price ||
        !preference
    ) {
        showToast("Please enter valid booking details!");
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

    // Display booking confirmation
    const confirmation = document.getElementById(
        "bookingConfirmation"
    );

    if (confirmation) {

        confirmation.textContent =
            "BOOKING CONFIRMED! Booking ID: " +
            booking.id +
            " | Match: " +
            booking.match +
            " | Tickets: " +
            booking.quantity +
            " | Total: ₹" +
            booking.total;

        confirmation.classList.add("show-confirmation");
    }

    displayBookings();

    showToast("Your booking has been confirmed!");

    // Reset form and summary
    form.reset();

    updateSummary(false);
}

// =========================================
// 10. INITIALIZE WEBSITE
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // Smooth scrolling for Book buttons
    document.querySelectorAll('a[href="#booking"]').forEach(
        function (link) {

            link.addEventListener("click", function (event) {

                event.preventDefault();

                const match = link.dataset.match;

                const matchSelect = document.getElementById("match");

                if (match && matchSelect) {
                    matchSelect.value = match;
                    updateSummary(false);
                }

                scrollToBooking();
            });
        }
    );

    // Team filter
    const teamFilter = document.getElementById("teamFilter");

    if (teamFilter) {

        teamFilter.addEventListener("change", function () {

            const selected = teamFilter.value;

            document.querySelectorAll("#matchTable tbody tr").forEach(
                function (row) {

                    const teams = row.dataset.teams || "";

                    row.style.display =
                        selected === "all" ||
                        teams.split(" ").includes(selected)
                            ? ""
                            : "none";
                }
            );
        });
    }

    // Booking form
    const form = document.getElementById("bookingForm");

    if (form) {

        // Activity 5: Booking form submission
        form.addEventListener("submit", handleBooking);

        // Activity 7: DOM selectors
        const matchSelect = form.querySelector("#match");
        const standSelect = form.querySelector("#stand");
        const quantityInput = form.querySelector("#quantity");

        // Listen for match selection changes
        matchSelect.addEventListener("change", function () {
            updateSummary(true);
        });

        // Listen for stand category changes
        standSelect.addEventListener("change", function () {
            updateSummary(true);
        });

        // Update quantity while typing
        quantityInput.addEventListener("input", function () {
            updateSummary(false);
        });

        // Confirm quantity selection
        quantityInput.addEventListener("change", function () {
            updateSummary(true);
        });

        // Reset form and summary
        form.addEventListener("reset", function () {

            setTimeout(function () {

                updateSummary(false);

                const confirmation = document.getElementById(
                    "bookingConfirmation"
                );

                if (confirmation) {
                    confirmation.textContent = "";
                    confirmation.classList.remove("show-confirmation");
                }

            }, 0);
        });

        // Initial summary
        updateSummary(false);
    }

    // Load saved bookings
    displayBookings();

});