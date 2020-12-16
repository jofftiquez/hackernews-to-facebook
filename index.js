require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const app = express();

const axios = require('axios');
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const PORT = process.env.PORT || 4200;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

console.log(USER, PASSWORD);

app.use(cors({ origin: true }));
// app.use(basicAuth({
//   users: {
//     [USER]: PASSWORD,
//   }
// }));

const handleError = (e) => {
  if (e.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    // console.log(e.response.data);
    // console.log(e.response.status);
    const { data } = e.response;
    return data;
  }
  // Something happened in setting up the request that triggered an Error
  return e;
};

// Get list of top stories from hacker news
async function getTopStories () {
  try {
    const { data } = await axios({
      method: 'GET',
      url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    });
    return data;
  } catch (e) {
    console.error('Error: getTopStories');
    throw handleError(e);
  }
}

// Get a specific story from hacker news
async function getItem (id) {
  try {
    const { data } = await axios({
      method: 'GET',
      url: `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    });
    return data;
  } catch (e) {
    console.error('Error: getItem');
    throw handleError(e);
  }
}

// Publish a link to fb page
async function postToFB (data) {
  try {
    const url = encodeURI(`https://graph.facebook.com/${FB_PAGE_ID}/feed?message=${data.title}&link=${data.url}&access_token=${FB_PAGE_ACCESS_TOKEN}`)
    await axios({
      method: 'POST',
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return data;
  } catch (e) {
    console.error('Error: postToFB');
    throw handleError(e);
  }
}

app.get('/', async (req, res) => {
  try {
    // GET TOP STORIES
    const topStories = await getTopStories();
    // GET RANDOM ARTICLE FROM TOP STORIES
    const randomStoryIndex = Math.floor((Math.random() * topStories.length) + 1);
    const { title, url } = await getItem(topStories[randomStoryIndex]);
    // POST TO FACEBOOK PAGE
    await postToFB({ title, url });
    res.json({ randomStoryIndex, title, url });
  } catch (e) {
    console.error(e);
    res.json(e);
  }
});

app.get('/foo', (req, res) => {
  res.json({ foo: 'haha' });
});

app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
});
