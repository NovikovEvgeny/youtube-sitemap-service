import { youtube_v3 as youtubeV3, google } from 'googleapis';

import Youtube = youtubeV3.Youtube;
import Schema$PlaylistItem = youtubeV3.Schema$PlaylistItem;
import Params$Resource$Playlistitems$List = youtubeV3.Params$Resource$Playlistitems$List;

export type VideoDetails = {
  id: string,
  title: string,
  description?: string,
  publishedAt?: string,
};

export type GetVideosPageResponse = {
  nextPageToken?: string,
  items: VideoDetails[],
};

/**
 * Service-extractor of youtube videos from the channel in JSON format
 *
 * @see https://www.youtube.com/watch?v=RjUlmco7v2M
 * @see https://developers.google.com/youtube/v3/docs/playlistItems/list
 */
export class YoutubeVideosService {
  private service: Youtube = google.youtube('v3');

  readonly apiKey: string;

  readonly channelId: string;

  private uploadsPlaylistId: string = '';

  constructor(apiKey: string, channelId: string) {
    this.apiKey = apiKey;
    this.channelId = channelId;
  }

  async init(): Promise<void> {
    const channelContentDetails = await this.service.channels.list({
      key: this.apiKey,
      part: 'contentDetails',
      id: this.channelId,
    });

    // Extract "uploads" playlist - all uploaded videos to the channel
    // @ts-ignore
    this.uploadsPlaylistId = channelContentDetails.data.items[0].contentDetails.relatedPlaylists.uploads;
    console.log(`Uploads playlist id is: ${this.uploadsPlaylistId}`);
  }

  /**
   * Get next 50 videos in the "uploads" playlist
   *
   * @param pageToken page token parameter - see Youtube DATA API docs
   */
  async getVideosPage(pageToken?: string): Promise<GetVideosPageResponse> {
    const requestParams: Params$Resource$Playlistitems$List = {
      key: this.apiKey,
      playlistId: this.uploadsPlaylistId,
      part: 'snippet',
      maxResults: 50,
    };

    if (pageToken) {
      requestParams.pageToken = pageToken;
    }

    const videosListResponse = await this.service.playlistItems.list(requestParams);
    const videosList: Schema$PlaylistItem[] = videosListResponse.data.items || [];

    const response: GetVideosPageResponse = {
      nextPageToken: videosListResponse.data.nextPageToken,
      items: [],
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const video of videosList) {
      if (video.id && video.snippet && video.snippet.title) {
        response.items.push({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
        });
      }
    }

    return response;
  }
}
