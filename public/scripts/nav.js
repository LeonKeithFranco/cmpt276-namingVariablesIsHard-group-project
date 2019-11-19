function goTo(page) {
  return () => window.location.href = `${window.location.origin}/${page}`
}

// for register page
$('#registerButton').click(goTo('register'));

// for main menu page
// $('#leaderboardButton').click(goTo('leaderboard'));
$('#leaderboardButton').click(() => {
  alert("Feature is still in development");
});
$('#logoutButton').click(goTo('logout'));

// for game modes and leaderboard
$('#backToMainMenuButton').click(goTo('main-menu'));
