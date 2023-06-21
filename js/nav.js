"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/**
 * Handles the click event on the submit story navigation button.
 * It hides other page components, shows the all stories list, and displays the submit form.
 *
 * @param {Event} evt - The click event object.
 * @returns {void}
 */
function navStorySubmitClick(evt) {
  console.debug("navStorySubmitClick", evt);
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", navStorySubmitClick);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/**
 * Handles the click event on the favorites navigation button.
 * It logs a debug message, hides other page components, and puts the favorites list on the page.
 *
 * @param {Event} evt - The click event object.
 * @returns {void}
 */
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

/**
 * Handles the click event on the "My Stories" navigation button.
 * It logs a debug message, hides other page components, puts the user's stories on the page,
 * and shows the section displaying the user's own stories.
 *
 * @param {Event} evt - The click event object.
 * @returns {void}
 */
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

$body.on("click", "#nav-my-stories", navMyStories);

/**
 * Handles the click event on the profile navigation button.
 * It logs a debug message, hides other page components, and shows the user profile section.
 *
 * @param {Event} evt - The click event object.
 * @returns {void}
 */
function navProfileClick(evt) {
  console.debug("navProfileClick", evt);
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on("click", navProfileClick);
