"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    return new URL(this.url).host;
  } //takes the URL stored in the 'url' property, creates a 'URL' object and retrieves the host name from the URL, then returns the host name as a string
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { author, title, url } /* user, newStory */) {
    const token = user.loginToken; //extracts the token from the user object for authentication purposes
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { author, title, url } },
    }); //makes an HTTP POST request using the token and story object and waits for a response containing the data from the API

    const story = new Story(response.data.story); //takes the response data to create a new story object using the Story constructor
    this.stories.unshift(story);
    user.ownStories.unshift(story); //new story object is added to two arrays and the unshift method is used to prepend the object to the beggining of each array

    return story; //returns the newly created story object
  }

  async removeStory(user, storyId) {
    const token = user.loginToken; //retrieves the loginToken property from the user object and assigns it to the token variable
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken },
    }); //the axios function is called, sending an HTTP DELETE request to the url endpoint, the storyId parameter is included in the url to specify the story to be deleted. the request's body contains an object with a token property that holds the login token from the user object. the axios function returns a promise and the await keyword is used to ensure the HTTP request is completed before proceeding

    this.stories = this.stories.filter((story) => story.storyId !== storyId); //after the story is successfully deleted from the server, the this.stories array is updated using the filter method using the storyId to create a new array with all the stories except the one being removed

    user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId); //the user.ownStories array is also updated
    user.favorites = user.favorites.filter((s) => s.storyId != storyId); //the user.favorites array is also updated
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(story) {
    this.favorites.push(story); //takes the story parameter and pushes it to the this.favorites array where favorite storyies are stored
    await this.updateFavorite("add", story); //uses the await keyword to pause the addFavorite function until the updateFavorites function is complete with the add and story parameters
  }

  async removeFavorite(story) {
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId); //updates the favorites array by filtering out the story with a storyId matching the provided story object. it creates a new array with all the favorites except the one being removed
    await this.updateFavorite("remove", story); //uses the await keyword to pause the removeFavorites function until the updateFavorites function is complete with the remove and story parameters
  }

  async updateFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE"; //the method variable is assigned either POST or DELETE based on the newState value, add being POST and remove being DELETE
    const token = this.loginToken; //the token variable is assigned the loginToken from the this object which represents the user
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    }); //the await keyword is used to pause the updateFavorites function and wait for the axios request to be complete. it sends an HTTP request to the url endpoint with the appropriate method, the user username, and the token in the request body
  }

  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  } //the some method is used to check if there is at least one element in the favorites array that has the same storyId as the provided story object. the function returns true if a match is found which means the story is a favorite or false if its not
}
