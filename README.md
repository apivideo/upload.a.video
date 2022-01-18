[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video)

[![badge](https://img.shields.io/github/stars/apivideo/uploadavideoApps?style=social)](https://github.com/apivideo/uploadavideoApps)

[![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)

![](https://github.com/apivideo/API_OAS_file/blob/master/apivideo_banner.png)

<h1 align="center">api.video upload a video</h1>

[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.

## Upload a video

This app utilizes a number of different ways to upload a video to [api.video](https://api.video)\

* [upload.a.video](https://upload.a.video) uses a [delegated token](https://docs.api.video/reference/post_upload-tokens) t upload a video into your account.  To make this standaolne html to work with your api.video account, you'll need delegated token and the value inserted into the URL paramater on line 61 of index.html.

* [upload.a.video/toDiscord](https://upload.a.video/toDiscord) is the same codebase, but in the form, you can add a Discord server ID to add the bot. There are more instructions in the [tutorial](https://api.video/blog/tutorials/upload-a-video-discord).

* [upload.a.video/JS.html](https://upload.a.video/JS.html) also uses the delegated upload token, but also uses the [Javascript video uploader](https://docs.api.video/docs/video-uploader) library to further simplify the upload process.


## Changes

August 2021: upload size set to 6 MB segments.
