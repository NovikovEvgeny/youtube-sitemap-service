import express, { Request, Response } from 'express';
import { YoutubeVideosService, GetVideosPageResponse, VideoDetails } from './YoutubeVideosService';

const app = express();
const config = require('../config.json');

class YoutubeServicesExecutors {
  [index: string]: YoutubeVideosService;
}

const youtubeServicesExecutors = new YoutubeServicesExecutors();

async function addChannelIfNotExists(channelId: string) {
  if (!youtubeServicesExecutors[channelId]) {
    youtubeServicesExecutors[channelId] = new YoutubeVideosService(config.auth.apiKey, channelId);
    await youtubeServicesExecutors[channelId].init();
  }
}

type GetPageDTO = {
  nextPageLink?: string,
  items?: VideoDetails[],
};

app.get('/youtube/videos/:channelId/:nextPageToken?', async (req: Request, res: Response) => {
  const { channelId } = req.params;
  await addChannelIfNotExists(channelId);

  const videos: GetVideosPageResponse = await youtubeServicesExecutors[channelId]
    .getVideosPage(req.params.nextPageToken);

  const response: GetPageDTO = {
    items: videos.items,
  };

  if (videos.nextPageToken) {
    response.nextPageLink = `${config.server.domain}:`
      + `${config.server.port}/youtube/videos/${channelId}/${videos.nextPageToken}`;
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
});


(async () => {
  const allPromises = config.channelIds.map((id: string) => addChannelIfNotExists(id));
  await Promise.all(allPromises);

  app.listen(config.server.port, () => console.log(`Example app listening on port ${config.server.port}!`));
})();
