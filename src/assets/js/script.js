// scroll section — active nav link + show-animate
window.onscroll = () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".navbar__link");
    const scrollY = window.scrollY;

    sections.forEach((sec) => {
        const offset = sec.offsetTop - 400;
        const height = sec.offsetHeight;
        const id = sec.getAttribute("id");

        if (scrollY >= offset && scrollY < offset + height) {
            navLinks.forEach((link) =>
                link.classList.remove("navbar__link--active")
            );
            const active = document.querySelector(
                `.navbar__link[href*="${id}"]`
            );
            if (active) active.classList.add("navbar__link--active");
            sec.classList.add("show-animate");
        }
    });

    const header = document.querySelector("header");
    if (header) {
        header.classList.toggle("header--sticky", scrollY > 100);
    }
};

// header state on page load
window.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (header) {
        header.classList.toggle("header--sticky", window.scrollY > 100);
    }
    // force initial active nav + show-animate
    window.onscroll();
});

// years of experience
const labelYears = document.querySelectorAll(".experience__years");
const yearInit = 2014;
const yearNow = new Date().getFullYear();
const years = yearNow - yearInit;
labelYears.forEach((label) => {
    label.innerHTML = years.toString();
});
