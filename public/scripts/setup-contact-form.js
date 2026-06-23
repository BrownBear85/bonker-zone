init();

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
e.preventDefault();
status.textContent = "Sending...";

const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
};

try {
    const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });

    if (res.ok) {
    status.textContent = "Thanks! I'll get back to you soon.";
    form.reset();
    } else {
    status.textContent = "Something went wrong. Please try again.";
    }
} catch {
    status.textContent = "Something went wrong. Please try again.";
}
});