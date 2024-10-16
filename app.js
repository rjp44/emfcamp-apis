const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const truncate = import('truncate-text-between-words');



const app = express();

app.use(cors());
app.use(bodyParser.json());

let Schedules = axios.get('https://www.emfcamp.org/schedule/2024.json');

let Villages = axios.get('https://www.emfcamp.org/api/villages');



// Schedule endpoint
app.get('/schedule', async (req, res) => {
  const { search, upcoming } = req.query;
  let now = new Date("2024-05-30 17:00:00 UTC+1"); // At the start of EMFCamp
  let nextHour = now.valueOf() + (60 * 60 * 1000);

  let { data: schedules } = await Schedules;
  let { data: villages } = await Villages;
  const {
    truncateText
  } = await truncate;

  let future = schedules
    .filter(talk => !talk.end_date || (new Date(`${talk.end_date} UTC+1`).valueOf()) > now.valueOf());
  if (search) {
    let searches = new RegExp(`(${search.replace(/,/g, "|")})`, "i");
    const results = future
      .filter((talk) =>
        (talk.title + talk.speaker + talk.description).match(searches))
      .map(({ title, description, start_date, end_date, speaker, venue }) => ({ title, description: truncateText(description, 300), start_date, end_date, speaker, venue }));
    return res.json(results);
  }
  else if (upcoming) {
    return (
      res.json(
        future.filter((talk) => {
          let start = talk.start_date && (new Date(`${talk.start_date} UTC+1`)).valueOf();
          return start && start < nextHour && start > now;
        })
      )
    );



  }

  return res.json(future);
});

// Village endpoint
app.get('/villages', async (req, res) => {
  const { search } = req.query;
  const {
    truncateText
  } = await truncate;

  let { data: schedules } = await Schedules;
  let { data: villages } = await Villages;

  if (search) {
    let searches = new RegExp(`(${search.replace(/,/g, "|")})`, "i");
    const results = villages.filter((village) =>
      (village.name + village.description).match(searches))
      .map(({ name, description }) => ({ name, description: truncateText(description, 300), start_date, end_date, speaker }));;
    return res.json(results);
  }

  res.json(villages);
});

// Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
