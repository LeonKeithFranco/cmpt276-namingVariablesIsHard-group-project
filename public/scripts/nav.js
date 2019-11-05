function goTo(page) {
    return () => window.location.href = `${window.location.origin}/${page}`
}

// for register page
$("#registerButton").click(goTo('register'));

//for main menu page
$("#logoutButton").click(goTo('logout'));