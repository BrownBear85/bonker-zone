var mouseX = 0, mouseY = 0;
var xOffset = 0, yOffset = 0;
var bgOffset = 0.0;

function init() {
    initStyle();
    applyClasses();
    buildPage();
    addListeners();
    requestAnimationFrame(frame);
}

function initStyle() {
    // Initialize the values of certain css properties
    document.documentElement.style.setProperty("--hue", (Math.random() * 360) + "deg");
    document.documentElement.style.setProperty("--bg-offset", "0px");
}

function applyClasses() {
    // Make most visible elements draggable
    const draggable = document.querySelectorAll("h1,h2,h3,img:not(.undraggable),div:not(.undraggable)");
    draggable.forEach(element => {
        element.classList.add("draggable");
    });

    // Make most visible elements scale up upon hover
    const hoverable = document.querySelectorAll(".draggable,a");
    hoverable.forEach(element => {
        element.classList.add("hoverable");
    });

    const links = document.querySelectorAll("a");
    links.forEach(element => {
        if (element.href.indexOf("https") != -1 && element.href.indexOf("bonker.zone") == -1) {
            element.target = "_blank";
            element.rel = "noopener noreferrer";
        }
    });
}

function buildPage() {
    // Add background
    const bg = document.createElement("div");
    bg.classList.add("bg", "undraggable");
    document.body.insertBefore(bg, document.body.childNodes[0]);

    // Add home button
    if (!document.body.classList.contains("no-home-button")) {
        const home = document.createElement("a");
        home.classList.add("metal", "home", "button", "hoverable", "rainbow");
        home.draggable = false;
        home.href = "index.html";
        home.textContent = "Home";
        document.body.appendChild(home);
    }
}

function addListeners() {
    // window.addEventListener('mousedown', onMouseDown);
    // window.addEventListener('mouseup', onMouseUp);
    // window.addEventListener('mousemove', onMouseMove);
}

function onMouseDown(event) {
    if (event.target.classList.contains("hoverable")) {
        event.target.classList.add("selected");
        if (event.target.classList.contains("draggable")) {
            event.target.classList.add("dragged");
            
            rect = event.target.getBoundingClientRect();
            window.xOffset = rect.left - window.mouseX;
            window.yOffset = rect.top - window.mouseY;

            event.target.style.position = "fixed";
            event.target.style.left = window.mouseX + "px";
            event.target.style.top = window.mouseY + "px";

            event.target.remove();
            document.body.appendChild(event.target);
        }
    }
}

function onMouseUp(event) {
    for (element of document.getElementsByClassName("selected")) {
        element.classList.remove("selected");
        element.classList.remove("dragged");
    }
}

function onMouseMove(event) {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
}

function frame(timestamp) {
    // Animate background
    window.bgOffset += 0.5;
    document.documentElement.style.setProperty("--bg-offset", Math.floor(window.bgOffset) + "px");
    
    // Move dragged element to mouse
    for (element of document.getElementsByClassName("dragged")) {
        element.style.left = window.xOffset + window.mouseX + "px";
        element.style.top = window.yOffset + window.mouseY + "px";
    }
    
    requestAnimationFrame(frame);
}

init();