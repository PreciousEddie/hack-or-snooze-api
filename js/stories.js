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
 *
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

async function submitNewStory(evt) {
  console.debug("submitNewStory"); //debug message is printed to console indicating the submitNewStory function was triggered
  evt.preventDefault(); //preventDefault method is called on the evt object to make sure the form does not dubmit and refresh the page

  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val(); //the values of the input fields are stored in the respective variables
  const username = currentUser.username; //the username property is accessed from the currently logged in user
  const storyData = { author, title, url, username }; //a new object is created with the properties author, title, url, and username which holds the values obtained from the input fields and the current user

  const story = await storyList.addStory(currentUser, storyData); //the addStory method is called on the storyList object passing currentUser and storyData as arguments adding a new story to the list. the await keyword is is used to wait for the promise from the addStory function to be resolved and assigns the value to the story variable

  const $story = generateStoryMarkup(story); //the generateStoryMakeup function is called passing the story object as an argument to generate the HTML markup for it and assign it to the $story DOM element
  $allStoriesList.prepend($story); //the $story DOM element is prepended to the $allStoriesList DOM element

  $submitForm.slideup("slow"); //the $submitForm element is animated to slide up and hide using the slideUp method with the "slow" duration
  $submitForm.trigger("reset"); //the reset event is triggered on the $submitForm element using the trigger method to reset the form fields to their initial values
}

$submitForm.on("submit", submitNewStory); //using the on method an event listener is attatched to the $submitForm element to call the submitNewStory function

function getDeleteBtnHTML() {
  return `
  <span class="trash-can">
  <i class="fas fa-trash-alt"></i>
  </span>`; //function returns a string containing the HTML markup for a delete button. the button is represented by a span element with a trash icon from the Font Awesome library inside an i element. this function can be used to generate the HTML for a delete button dynamically in Javascript
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story); //the isFavorite variable is declared and assigned the result of calling the isFavorites method on the user object, passing the story object as an argument. it checks if a story is a favorite for the user
  const starType = isFavorite ? "fas" : "far"; //the starType variable is delcared and assigned a value based on the isFavorites variable. if isFavorites is true, starType is set to fas, otherwise it is set to far. this determines the type of star icon to be displayed
  return `
  <span class="star">
  <i class="${starType} fa-star"></i>
  </span>`; //the string returned by the getStarHTML function contains the HTML markup for a star icon. it consists of a span element with a class star and an i element representing the star icon. the class of the i element is determined by the starType variable which results in either fas or far class being applied to the i element
}

async function deleteStory(evt) {
  console.debug("deleteStory"); //a debug message is printed to the console indicating the deleteStory event was triggered

  const $closestLi = $(evt.target).closest("li"); //the $(evt.target) expression selects the element that triggered the event which would be the trash icon in this case. the closest("li") method looks for the closest li element ancestor of the trash icon. the resulting closest li element is assigned to the $closestLi variable
  const storyId = $closestLi.attr("id"); //the attr("id") method is called on the $closestLi element to retrieve the value of the id attribute. this assumes that each li element has an id attribute that corresponds to the story ID

  await storyList.removeStory(currentUser, storyId); //the removeStory method is called on the storyList object passing the currentUser object and the storyID as arguments. this method is expected to remove the story with the given ID from the story list and update the necessary data

  await putUserStoriesOnPage(); //the putUserStoriesOnPage function is called to update and display the users stories on the page after a story has been deleted
}

$ownStories.on("click", ".trash-can", deleteStory); //adds an event listener to the $ownStories element and listens for a click event on elements with the trash-can class inside the $ownStories element. when the click event is triggered on a trash can icon, the deleteStory function is called passing the event object

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage"); //a debug message is printed to the console indicating the putStoriesOnPage function is called

  $ownStories.empty(); // the ownStories DOM element is emptied using the empty method to ensure any existing content within the ownStories element is cleared before adding new stories

  if (currentUser.ownStories.length === 0) {
    //this checks if the currentUser object's ownStories array has a length of 0 indicating that the user has not added any stories yet
    $ownStories.append("<h5>No stories added by user yet!</h5>"); //if the array length is 0, the $ownStories element appends an <h5> element with the text provided
  } else {
    //if the array length is not 0, the code enters the else block
    for (let story of currentUser.ownStories) {
      //the code iterates over each story in the currentUser.ownStories array using a for...of loop
      let $story = generateStoryMarkup(story, true); //within the loop the generateStoryMarkup function is called to generate the HTML markup for the current story, passing story and true as arguments. the second argument "true", indicates that the story is owned by the current user. the resulting markup is assigned to the $story variable
      $ownStories.append($story); //the $story element is appeneded to the $ownStories element using the append method adding it the user's stories section
    }
  }
  $ownStories.show(); // after the loop the $ownStories element is shown using the show method to make sure that the user's stories section is displayed on the page
}

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage"); //a debug message is printed to the console indicating that the putFavoritesListOnPage function is called

  $favoritedStories.empty(); //the $favoritedStories DOM element is emptied using the empty method to ensure any existing content within the favoritedStories element is cleared before adding new favorited stories

  if (currentUser.favorites.length === 0) {
    // this checks if the currentUser object's favorites array has a length of 0 indicating that the user has not favorited any stories yet
    $favoritedStories.append("<h5>No favorites added!</h5>"); //if the array length is 0, the $favoritedStories element appends an <h5> element with the text provided
  } else {
    //if the array length is not 0, the code enters the else block
    for (let story of currentUser.favorites) {
      //the code iterates over each story in the currentUser.favorites array using a for...of loop
      const $story = generateStoryMarkup(story); //within the loop the generateStoryMarkup function is called to generate the HTML markup for the current story, passing story as an argument. the resulting markup is assigned to the $story variable
      $favoritedStories.append($story); //the $story element is appeneded to the $favoritedStories element using the append method adding it the section where favorited stories are displayed
    }
  }
  $favoritedStories.show(); // after the loop the $favoritedStories element is shown using the show method to make sure that the section where favorited stories are displayed is visible on the page
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite"); //a debug message is printed to the console indicating that the toggleStoryFavorite function has been called

  const $tgt = $(evt.target); //the $(evt.target) expression selects the element that triggered the event which is the star icon in this case and assigns it to the $tgt variabe
  const $closestLi = $tgt.closest("li"); //the $closestLi variable is assigned the closest <li> element ancestor of the clicked star icon using the closest("li") method
  const storyId = $closestLi.attr("id"); //the storyId variable is assigned the value of the ID attribute of the $closestLi element. this assumes that each li element has an ID attribute that corresponds to the storyId
  const story = storyList.stories.find((s) => s.storyId === storyId); //the story variable is assigned the story object from the storyList.stories array that has a storyId matching the storyId obtained in the previous step. this allows us to retrieve the specific story object associated with the clicked star icon

  if ($tgt.hasClass("fas")) {
    //the code checks if the clicked star icon has the "fas" class indicating that the story is already favorited by the user
    await currentUser.removeFavorite(story); //if the clicked star icon has the "fas" class, the removeFavorite method is called on the currentUser object, passing the story as an argument, to remove the story from the user's favorites.
    $tgt.closest("i").toggleClass("fas far"); //the star icon's class is toggled between "fas" and "far" using the toggleClass method to visually indicate the change in favorited status
  } else {
    //if the clicked star icon does not have the "fas" class, the code enters the else block
    await currentUser.addFavorite(story); // the addFavorite method is called on the currentUser object, passing the story as an argument, to add the story to the user's favorites.
    $tgt.closest("i").toggleClass("fas far"); //the star icon's class is toggled between "fas" and "far" using the toggleClass method
  }
}

$allStoriesList.on("click", ".star", toggleStoryFavorite); //an event listener is added to the $llStoriesList DOM element to listen for a click event on elements with the star class inside the $allStoriesList element. when the click event is triggered on a star icon, the toggleStoryFavorite function is called, passing the event object
