"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin"); //a debug message is printed to the console indicating that the updateUIOnUserLogin function has been called

  hidePageComponents(); //the hidePageComponents function is called which is responsible for hiding various page components, such as the login/signup forms and other sections

  putStoriesOnPage(); //the putStoriesOnPage function is called which is responsible for populating the list of all the stories on the page
  $allStoriesList.show(); //the $allStoriesList is shown using the show method to ensure that the list of all stories is visible on the page

  updateNavOnLogin(); //the updateNavLogin function is called which is responsible for updating the navigation bar based on the user's login status. it may show or hide certain navigation links or display the user's username
  generateUserProfile(); //the generateUserProfile function is called which is responsible for generating the user's profile section on the page which may include info such as the user's username
  $storiesContainer.show(); //the $storiesContainer element is shown using the show method to ensure that the container for displaying stories is visible on the page
}

function generateUserProfile() {
  console.debug("generateUserProfile"); //a debug message is printed to the console indicating that the generateUserProfile function has been called

  $("#profile-name").text(currentUser.name); //the text method is called on the #profile-name DOM element, and the currentUser.name value is passed as the argument. this sets the text content to the value of the currentUser.name property
  $("#profile-username").text(currentUser.username); //the text method is called on the #profile-username DOM element, and the currentUser.username value is passed as the argument. this sets the text content to the value of the currentUser.username property
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10)); //the text method is called on the #profile-account-date DOM element, and the currentUser.createdAt.slice(0, 10) value is passed as the argument. this sets the text content to the first 10 characters of the  currentUser.createdAt property, representing the account creation date
}
