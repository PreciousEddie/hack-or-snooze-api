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

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      <div>
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
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
 * Handles the submission of a new story form.
 * It logs a debug message, prevents the default form submission behavior,
 * retrieves the form data, adds the story to the story list, generates the story markup,
 * prepends the story to the all stories list, hides the submit form, and resets the form fields.
 * @async
 * @param {Event} evt - The submit event object.
 * @returns {Promise<void>}
 */
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const username = currentUser.username;
  const storyData = { author, title, url, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideup("slow");
  $submitForm.trigger("reset");
}

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
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
  <i class="${starType} fa-star"></i>
  </span>`;
}

/**
 * Deletes a story when the delete button is clicked.
 * @async
 * @param {Event} evt - The click event object.
 * @returns {Promise<void>} - A promise that resolves once the story is deleted.
 */
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

/**
 * Renders the user's stories on the page.
 * @description This function empties the $ownStories container, and then appends the user's stories to it. If there are no stories, a message indicating that no stories have been added by the user is displayed. The stories are generated using the generateStoryMarkup function.
 * @returns {void}
 */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
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
 * @returns {Promise<void>} - A promise that resolves when the favorite status is toggled.
 */
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$allStoriesList.on("click", ".star", toggleStoryFavorite);
