require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
bodyParser = require('body-parser');
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: "text/plain" }));
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

//rate limiting code
//rate limiting to protect the demos
const rateLimit = require("express-rate-limit");
app.use(
	rateLimit({
	  windowMs:  60 * 60 * 1000, // 1 hour duration in milliseconds
	  max: 5,
	  message: "You exceeded 5 requests in 1 hour.",
	  headers: true,
	})
  );
  
  
  



//apivideo
const apiVideo = require('@api.video/nodejs-sdk');


//if you chnage the key to sandbox or prod - make sure you fix the delegated toekn on the upload page
const apiVideoKey = process.env.apiProductionKey;


//this applies the ratelimit to all uploads.  Limit to 5 per hour
app.get('/ratelimit',(req,res)=>{
	console.log("rate limiting test");
	res.sendStatus(200);
});


app.post('/webhook',(req,res) =>{
///	console.log("body" ,req.body);
	var reqBody = JSON.parse(req.body);
///	console.log("reqBody",reqBody);
	//video uploaded -but check to see if the 
	var videoId = reqBody.videoId;
	var videoQuality  = reqBody.quality;
	console.log("received  " + videoId + " " +videoQuality);
	//we need to see if this videoId and qulity have been encoded.
	//loop through all the webhook responses
	
	function checkWebhook(videoId, videoQuality, webhooks){
		foundMatch = false;
		console.log("there are " + webhooks.length + " webhook entries to scan");
		
		
		for(var i=0;i<webhooks.length;i++){
			
			/*
			var webhookEmitted = webhooks[i].emittedAt;
			//convert this to a date
			//2021-01-29T16:46:25.217+01:00
			//year month date
			console.log("webhookEmitted", webhookEmitted);
			webhookEmitted = webhookEmitted.slice(0,7);
			webhookDate = Date.parse(webhookEmitted);
			console.log( Date.now, webhookDate);
			if(Date.now - webhookDate >86000000){
				//this webhook is over a day old.
				webhooks.splice(i);
			}
			else{
			*/
				//this is a recent webhook
			//	console.log("two videoIds " +webhooks[i].videoId + " " + videoId )
			//	console.log("two qualties " +webhooks[i].quality + " " + videoQuality )
				if(webhooks[i].videoId === videoId && webhooks[i].quality === videoQuality){
					//we have a match!!
					foundMatch = true;
					res.sendStatus(200); 				

				}
			//}
		}
		if(!foundMatch){
			//no match yet, so wait 2 seconds and try again
			//not encoded yet, wait 2 sec and re-reun checkMp4
			console.log("no webhook yet.");
			setTimeout(checkWebhook,2000,videoId, videoQuality, webhooks);
		}
	}
	checkWebhook(videoId, videoQuality, webhooks);

})

var webhooks = [];
webhookResponse = {"event":"intro", 
			"emittedAt": Date.now, 
			"videoId":"12345",
			"encoding":"hls",
			"quality": "200"
			}
webhooks.push(webhookResponse);
//receive a webhook that encoding is ready
app.post("/receive_webhook", function (request, response) {
	console.log("new video event from api.video");
  
  
	//webhooks.push("New api.video event");
	let event = request.body;
	let body =request.body;
	console.log((body));
	 let headers = request.headers;
//	console.log("headers",headers);
	let type = body.type;
	let emittedAt = body.emittedAt;
	let webhookResponse="";
	let liveStreamId = "";
	let liveStreamStatus = false;
	//we're only getting video.encoding.quality.completed right now.. but let's be careful in case the webhook changes

	if (type =="video.encoding.quality.completed"){
	  let videoId = body.videoId;
	  let encoding = body.encoding;
	  let quality = body.quality;
	  liveStreamId = body.liveStreamId;
	  webhookResponse = {"event":type, 
	  					"emittedAt": emittedAt, 
						"videoId":videoId,
						"encoding":encoding,
						"quality": quality
						}
	  
	} 
  
	//console.log(headers);
	console.log("response",webhookResponse);
	//webhook url
  

	webhooks.push(webhookResponse);
	
	response.sendStatus(200);  
  });
//end webhook  

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



	