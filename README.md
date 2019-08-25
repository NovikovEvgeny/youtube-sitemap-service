# Youtube sitemap service

For crawling all the videos from specified YouTube channel

## Install

```
git clone git@github.com:NovikovEvgeny/youtube-sitemap-service.git
cd youtube-sitemap-service
npm install
```

## Running

1. rename `config.example.json` to `config.json` and fill properties. Api key you can 
get following documentation from [this doc](https://cloud.google.com/docs/authentication/api-keys?hl=ru&visit_id=637022755812097166-2283106956&rd=1)
2. run `npm run-script build && node dist/index.js` to start server
3. open browser and go to 
```
http://localhost:8080/youtube/videos/<YOUTUBE_CHANNEL_ID>
```

you will get a response which looks like 
```
{
  "items": [
    {
      "id": "<VIDEO_1_ID>",
      "title": "<VIDEO_1_TITLE>",
      "description": "<VIDEO_1_DESCRIPTION>",
      "publishedAt": "2017-07-02T15:07:52.000Z"
    },
    {
      "id": "<VIDEO_2_ID>",
      "title": "<VIDEO_2_TITLE>",
      "description": "<VIDEO_2_DESCRIPTION>",
      "publishedAt": "2000-00-00T08:35:40.000Z"
    },
// ....
  ],
  "nextPageLink": "http://localhost:8080/youtube/videos/<YOUTUBE_CHANNEL_ID>/<NEXT_PAGE_TOKEN>"
}
```

More about `<NEXT_PAGE_TOKEN>` you can read [here](https://developers.google.com/youtube/v3/docs/playlistItems/list)

So using url from `nextPageLink` property you can get next chunk of videos
