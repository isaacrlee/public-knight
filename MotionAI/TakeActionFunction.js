exports.handler = (event, context, callback) => {

    // VIEW DOCS HERE:  https://github.com/MotionAI/nodejs-samples

    /* "event" object contains payload from Motion AI
        {
            "from":"string", // the end-user's identifier (may be FB ID, email address, Slack username etc, depends on bot type)
            "session":"string", // a unique session identifier
            "botId":"string", // the Motion AI ID of the bot
            "botType":"string", // the type of bot this is (FB, Slack etc)
            "customPayload":"string", // a developer-defined payload for carrying information
            "moduleId":"string", // the current Motion AI Module ID
            "inResponseTo":"string", // the Motion AI module that directed the conversation flow to this module
            "reply":"string", // the end-user's reply that led to this module
            "result":"string" // any extracted data from the prior module, if applicable,
            "enrichedData":"object" // stringified NLP enriched data object parsed from a user's message to your bot
            "customVars":"string" // stringified object containing any existing customVars for current session
            "fbUserData":"string" // for Messenger bots only - stringified object containing user's meta data - first name, last name, and id
            "attachedMedia":"string" // for Messenger bots only - stringified object containing attachment data from the user
        }
    */

    // this is the object we will return to Motion AI in the callback
    var async = require('async');
    var request = require('request');
    var customVars = JSON.parse(event.customVars);
    var numMembers = 0;
    var numOrgs = 0;
    var orgs;
    var tags = String(customVars.tags).split(',');
    var tag_slugs = String(customVars.tag_slugs).split(',');
    var responseJSON = {
        "response": "Great!", // what the bot will respond with
        "continue": true, // "true" will result in Motion AI continuing the flow based on connections, whie "false" will make Motion AI hit this module again when the user replies
        "customPayload": "", // OPTIONAL: working data to examine in future calls to this function to keep track of state
        "quickReplies": null, // OPTIONAL: a JSON string array containing suggested/quick replies to display to the user .. i.e., ["Hello","World"]
        "cards": null, // OPTIONAL: a cards JSON object to display a carousel to the user (see docs)
        "customVars": null, // OPTIONAL: an object or stringified object with key-value pairs to set custom variables eg: {"key":"value"} or '{"key":"value"}'
        "nextModule": null // OPTIONAL: the ID of a module to follow this Node JS module
    }

    var q = async.queue(function (task, done) {
        request(task.url, function (err, res, body) {
            if (err) return done(err);
            if (res.statusCode != 200) return done(res.statusCode);
            
            orgs = JSON.parse(body);
            numMembers += Math.floor((Math.random() + 1) * orgs.length) * 1000;
            numOrgs += orgs.length;
            done();
        });
    }, 5);

    q.drain = function () {
        responseJSON.customVars = {"numMembers": numMembers, "numOrgs": numOrgs};
        callback(null, responseJSON);
    };

    for (var i = 0; i < tag_slugs.length; i++) {
        q.push({ url: "http://public-knight.herokuapp.com/orgs/tag/" + tag_slugs[i] });
    }
};