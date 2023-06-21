"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * Adds HTML markup for delete button and star icon
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  console.debug("generateStoryMarkup", story);
  return $(`
      <li id="${story.storyId}">
      <div>
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${Boolean(currentUser) ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${story.getHostName()})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**
 * Submits a new story form and adds the story to the story list.
 *
 * @param {Event} evt - The submit event object.
 * @returns {Promise} A promise that resolves once the new story is added.
 */
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // Retrieve the form input values
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const username = currentUser.username;

  // Create an object with the story data
  const storyData = { author, title, url, username };

  // Add the story to the story list using the addStory method
  const story = await storyList.addStory(currentUser, storyData);

  // Generate the HTML markup for the new story
  const $story = generateStoryMarkup(story);

  // Prepend the new story to the list of all stories
  $allStoriesList.prepend($story);

  // Hide the submit form and reset its values
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

// Attach the submit event handler to the submit form
$submitForm.on("submit", submitNewStory);

/**
 * Generates the HTML markup for a delete button.
 *
 * @returns {string} The HTML markup for the delete button.
 */
function getDeleteBtnHTML() {
  return `
  <span class="trash-can">
  <i class="fas fa-trash-alt"></i>
  </span>`;
}

/**
 * Generates the HTML markup for a star icon based on whether the story is a favorite or not.
 *
 * @param {object} story - The story object.
 * @param {object} user - The user object.
 * @returns {string} The HTML markup for the star icon.
 */
function getStarHTML(story, user) {
  return `
  <span class="star">
  <i class="${user.isFavorite(story) ? "fas" : "far"} fa-star"></i>
  </span>`;
}

/**
 * Deletes a story when the delete button is clicked.
 *
 * @param {Event} evt - The click event object.
 * @returns {Promise} - A promise that resolves once the story is deleted.
 */
async function deleteStory(evt) {
  console.debug("deleteStory");
  // Call the removeStory method of the storyList object to delete the story
  await storyList.removeStory(
    currentUser,
    $(evt.target).closest("li").attr("id")
  );

  // Refresh the user's stories on the page by calling putUserStoriesOnPage
  await putUserStoriesOnPage();
}

// Attach the click event handler to the trash-can icon within $ownStories
$ownStories.on("click", ".trash-can", deleteStory);

/**
 * Renders the user's stories on the page.
 */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
  hidePageComponents();
  $ownStories.empty();

  // Check if the current user has added any stories
  if (currentUser.ownStories.length === 0) {
    // If there are no stories, display a message indicating no stories added
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // If there are stories, iterate through each story
    for (let story of currentUser.ownStories) {
      // Generate the markup for the story using the generateStoryMarkup function
      // The second parameter (true) indicates that it's a user's own story
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

/**
 * Populates the favorites list on the page with the user's favorite stories.
 * If the user has no favorite stories, displays a message indicating no favorites.
 */
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
  hidePageComponents();

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

/**
 * Toggles the favorite status of a story when the star icon is clicked.
 * If the story is already favorited, removes it from the user's favorites.
 * If the story is not favorited, adds it to the user's favorites.
 * @param {Event} evt - The click event object.
 */
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");

  // Find the corresponding story object in the storyList.stories array
  const story = storyList.stories.find((s) => s.storyId === storyId);

  // Check if the target element has the "fas" class indicating it's currently favorited
  if ($tgt.hasClass("fas")) {
    // If it's favorited, remove it from the user's favorites
    await currentUser.removeFavorite(story);
    // Toggle the classes "fas" and "far" on the closest <i> element to switch the star icon
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // If it's not favorited, add it to the user's favorites
    await currentUser.addFavorite(story);
    // Toggle the classes "fas" and "far" on the closest <i> element to switch the star icon
    $tgt.closest("i").toggleClass("fas far");
  }
}

// Attach the toggleStoryFavorite function as a click event handler to the $allStoriesList element,
// targeting the elements with the "star" class within it
$allStoriesList.on("click", ".star", toggleStoryFavorite);
