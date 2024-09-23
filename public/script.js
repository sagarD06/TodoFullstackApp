import todoTemplate from "./templates.js";

const render = function (template, node) {
    if (!node) return;
    node.innerHTML = template;
};

let isAuthenticated = false;

if(isAuthenticated) {
    const node = document.getElementById("content");
    document.getElementById("auth-button").innerHTML = "Logout";
    render(todoTemplate, node);
}else{
    const node = document.getElementById("content");
    document.getElementById("auth-button").innerHTML = "Signin";
    node.innerHTML = "<button id='signup-button'>Sign Up</button>";
}
