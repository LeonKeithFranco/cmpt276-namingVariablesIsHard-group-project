function goTo(page) {
  return () => window.location.href = `${window.location.origin}/${page}`
}

// for register page
$('#registerButton').click(goTo('register'));

// for main menu page
// $('#leaderboardButton').click(goTo('leaderboard'));
$('#logoutButton').click(goTo('logout'));

// for game modes and leaderboard
$('#backToMainMenuButton').click(goTo('main-menu'));


$('#leaderboardButton').click(() => { // delete this when leaderboard is properly implemented
  alert("Feature is still in development");
});