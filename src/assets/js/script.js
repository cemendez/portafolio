// scroll section
let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll(".navbar__link");

window.onscroll = () => {
    sections.forEach((sec) => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 400;
        let height = sec.offsetHeight;
        let id = sec.getAttribute("id");

        if (top >= offset && top < offset + height) {
            navLinks.forEach((links) => {
                links.classList.remove("navbar__link--active");
                document
                    .querySelector(".navbar__link[href*=" + id + "]")
                    .classList.add("navbar__link--active");
            });
            sec.classList.add("show-animate");
        } else {
            sec.classList.remove("show-animate");
        }
    });

    let header = document.querySelector("header");
    if (header) {
        header.classList.toggle("header--sticky", window.scrollY > 100);
    }
};

// Ejecutar la comprobación del header sticky al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    let header = document.querySelector("header");
    if (header) {
        header.classList.toggle("header--sticky", window.scrollY > 100);
    }
});

// agregar años de experiencia
const labelYears = document.querySelectorAll(".experience__years");
const yearInit = 2014;
const yearNow = new Date().getFullYear();
const years = yearNow - yearInit;
labelYears.forEach((label) => {
    label.innerHTML = years.toString();
});
