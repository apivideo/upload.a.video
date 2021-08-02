require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
bodyParser = require('body-parser');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Discord = require('discord.js');
const discordClient = new Discord.Client();
// when the client is ready, run this code
// this event will only trigger one time after logging in
discordClient.once('ready', () => {
	console.log('discord Ready!');

});

// login to Discord with your app's token
//ginstructions for a discord API toke:
//https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot
discordClient.login(process.env.discordKey);



//apivideo
const apiVideo = require('@api.video/nodejs-sdk');


//if you chnage the key to sandbox or prod - make sure you fix the delegated toekn on the upload page
const apiVideoKey = process.env.apiProductionKey;

// website demo
//get request is the initial request - load the HTML page with the form
app.get('/toDiscord', (req, res) => {

		res.sendFile(path.join(__dirname, '../public', 'index.html'));  
});







app.post('/toDiscord', (req, res) => {
	console.log(req.body);
	console.log("video upload beginning");
	//console.log(req);
	//get values from POST body
	let videoId=req.body.videoId;
	let videoName = req.body.videoName;
	let videoDesc = req.body.videoDesc;
	let discordChannel = req.body.channel;
	let tag = "Discord";
	

	

	client = new apiVideo.Client({ apiKey: apiVideoKey});
	
	

	let result = client.videos.update(videoId, {	title: videoName, 
													description: videoDesc,					
													tags: [tag]
											});
											console.log(result);
	result.then(function(video) {
		console.log("video uploaded and renamed");
		//video name changed.  
		//now send it to discord
		//
		console.log(video);
		var playerUrl = video.assets.player;

		//we now have updated the video, and have the url - butu let's wait until the video is playeble before posting on discord (so the oembed works properly.)
		function checkPlayable(videoId) {
			console.log("checking mp4 encoding status");
			let status = client.videos.getStatus(videoId);
			status.then(function(videoStats){
			 // console.log(videoStats);
			  let playable = videoStats.encoding.playable;
			  let qualitylist = videoStats.encoding.qualities;
			  console.log("is video playable?", playable);
			  //only look for the mp4 if the video is playable
			  //when still encoding, sometimes the mp4 status does not appear immediately
			  if(playable){
				 console.log("video is playable");
				//send to discord
				//send 200 back to page
				var channel = discordClient.channels.cache.get(discordChannel);
				channel.send( videoDesc + playerUrl);
				res.sendStatus(200);

			  }else{
				  setTimeout(checkPlayable,2000,videoId);
			  }
		  }).catch((error) => {
				console.log(error);
			});	
		}
		checkPlayable(videoId);



	}).catch((error) => {
	    console.log(error);
	});
	
	

});


//testing on 3004
app.listen(process.env.PORT || 3004, () =>
  console.log('Example app listening on port 3004!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});



	