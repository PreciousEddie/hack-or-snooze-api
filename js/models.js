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
  }
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

  /**
   * Adds a new story to the system and updates the user's story and favorites lists.
   *
   * @param {User} user - The user object who is adding the story.
   * @param {object} storyData - The object containing the details of the new story. (Author, title, and URL)
   * @returns {Promise} - A Promise that resloves to the newly added Story object.
   */

  async addStory(user, { author, title, url }) {
    //Extract the login token from the user object
    const token = user.loginToken;

    // Make an HTTP POST request to the server to add the story
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { author, title, url } },
    });

    // Create a new Story object from the response data
    const story = new Story(response.data.story);

    // Add the new story to the beginning of the stories array in storyList
    this.stories.unshift(story);

    // Add the new story to the beginning of the ownStories array in the user object
    user.ownStories.unshift(story);

    // Return the newly added Story object
    return story;
  }

  /**
   * Removes a story from the system and updates the user's story and favorites lists.
   *
   * @param {User} user - The user object who is removing the story.
   * @param {string} storyId - The ID of the story to be removed.
   * @returns {Promise} - A promise that resolves when the removal is complete.
   */
  async removeStory(user, storyId) {
    // Make an HTTP DELETE request to the server to remove the story
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken },
    });

    // Remove the story from the stories array in storyList
    this.stories = this.stories.filter((story) => story.storyId !== storyId);

    // Remove the story from the ownStories array in the user object
    user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId);

    // Remove the story from the favorites array in the user object (if present)
    user.favorites = user.favorites.filter((s) => s.storyId != storyId);
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

  /**
   * Adds a sotry to the user's favorites and updates the favorites on the server.
   *
   * @param {Story} story - The story object to be added to favorites.
   * @returns {Promise} - A promise that resloves when the addition is complete.
   */
  async addFavorite(story) {
    // Add the story to the favorites array in the user object
    this.favorites.push(story);

    // Call the updateFavorite method to update the server-side favorites list
    await this.updateFavorite("add", story);
  }

  /**
   * Removes a story from the user's favorites and updates the favorites on the server.
   *
   * @param {Story} story - The story object to be removed from the favorites.
   * @returns {Promise} - A promise that resolves when the removal is complete.
   */
  async removeFavorite(story) {
    // Filter out the story from the favorites array in the user object
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);

    // Call the updateFavorite method to update the server-side favorites list
    await this.updateFavorite("remove", story);
  }

  /**
   * Updates the favorite status of a story for the current user on the server.
   * @async
   * @param {string} newState - The new state of the favorite status. Should either "add" or "remove".
   * @param {Story} story - The story object for which the favorite status is being updated.
   * @returns {Promise} - A promise that resolves when the update is complete.
   */
  async updateFavorite(newState, story) {
    // Determine the HTTP method based on the newState parameter
    const method = newState === "add" ? "POST" : "DELETE";

    // Retrieve the user's login token from the user object
    const token = this.loginToken;

    // Send an HTTP request to update the favorites list on the server
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  /**
   * Checks if a story is in the user's favorites.
   * @param {Story} story - The story object to check.
   * @returns {boolean} - True if story is in the user's favorites, false otherwise.
   */
  isFavorite(story) {
    // Use the Array some() method to check if any favorite story has the same storyId as the given story
    return this.favorites.some((s) => s.storyId === story.storyId);
  }
}
