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

function navStorySubmitClick(evt) {
  console.debug("navStorySubmitClick", evt); //a debug message is printed to the console to indicate that the navStorySubmitClick event was triggered and the evt parameter contains info about the event
  hidePageComponents(); //calls the function to hide or remove any visible page components to prepare for showing the submit form
  $allStoriesList.show(); //takes the OL DOM element and uses the show method to make it visible
  $submitForm.show(); //takes the FORM DOM element and uses the show method to make it visible
}

$navSubmitStory.on("click", navStorySubmitClick); //listens for the click event on the navSubmitStory DOM element and calls the navStorySubmitClick function

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

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt); //a debug message is printed to the console indicating the navFavoritesClick event was triggered and the evt parameter contains info about the event
  hidePageComponents(); //calls the hidePageComponents function to hide any visible page components to prepare for displaying the favorites list
  putFavoritesListOnPage(); //calls the putFavoritesListOnPage function to retrieve the users favorite stories and generates the HTML markup to display them on the page
}

$body.on("click", "#nav-favorites", navFavoritesClick); //adds an event listener to the body element using the on method and listens for a click event on the element with the nav-favorites ID. when the event is triggered it calls the navFavoritesClick function

function navMyStories(evt) {
  console.debug("navMyStories", evt); //a debug message is printed to the console indicating the navMyStories event was triggered and the evt parameter contains info about the event
  hidePageComponents(); //calls the hidePageComponents function to hide any visible page components to prepare for displaying the users stories
  putUserStoriesOnPage(); //calls the putUserStoriesOnPage function to retrieve the users stories and generates the HTML markup to display them on the page
  $ownStories.show(); //the $ownStories DOM element is shown using the show method
}

$body.on("click", "#nav-my-stories", navMyStories); //adds an event listener to the body element using the on method and listens for a click event on the element with the nav-my-stories ID. when the event is triggered it calls the navMyStories function

function navProfileClick(evt) {
  console.debug("navProfileClick", evt); //a debug message is printed to the console indicating the navProfileClick event was triggered and the evt parameter contains the info about the event
  hidePageComponents(); //calls the hidePageComponents function to hide any visible page components to prepare for displaying the users profile
  $userProfile.show(); //the $userProfile DOM element is shown using the show method
}

$navUserProfile.on("click", navProfileClick); //adds an event listener to the navUserProfile element using the on method and listens for a click event. when the event is triggered it calls the navProfileClick function
