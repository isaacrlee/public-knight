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
    var responseJSON = {
        "response": "", // what the bot will respond with
        "continue": true, // "true" will result in Motion AI continuing the flow based on connections, whie "false" will make Motion AI hit this module again when the user replies
        "customPayload": "", // OPTIONAL: working data to examine in future calls to this function to keep track of state
        "quickReplies": null, // OPTIONAL: a JSON string array containing suggested/quick replies to display to the user .. i.e., ["Hello","World"]
        "cards": [], // OPTIONAL: a cards JSON object to display a carousel to the user (see docs)
        "customVars": null, // OPTIONAL: an object or stringified object with key-value pairs to set custom variables eg: {"key":"value"} or '{"key":"value"}'
        "nextModule": null // OPTIONAL: the ID of a module to follow this Node JS module
    }
    var tags = String(JSON.parse(event.customVars).tags).split(',');
    var tag_slugs = String(JSON.parse(event.customVars).tag_slugs).split(',');
    var count = 0
    var q = async.queue(function (task, done) {
        request(task.url, function (err, res, body) {
            if (err) return done(err);
            if (res.statusCode != 200) return done(res.statusCode);
            var orgs = JSON.parse(body);
            if (orgs.length !== 0) {
                if (orgs.length > count) {
                    count = orgs.length;
                }
                var randa = [];
                randa.push(0);
                for (var i = 0; i < randa.length; i++) {
                    responseJSON.cards.push({
                        cardTitle: orgs[randa[i]].org_name, // Card Title
                        cardSubtitle: orgs[randa[i]].mission.substr(0, 75) + "...", // Card Subtitle
                        cardImage: orgs[randa[i]].avatar_image_url, // Source URL for image
                        cardLink: 'https://publicgood.com/org/' + orgs[randa[i]].org_slug, // Click through URL
                        buttons: [{
                            buttonText: 'Check them out', // Button Call to Action
                            buttonType: 'url',
                            target: 'https://publicgood.com/org/' + orgs[randa[i]].org_slug// Text to send to bot, or URL
                        }]
                    });
                }
            }
            done();
        });
    }, 5);

    q.drain = function () {
        if (responseJSON.cards.length === 0) {
            responseJSON.response = "Sorry, it doesn't look like we found any organizations in your community.";
        } else {
            responseJSON.response = "We found over " + count + " organizations." + "Here are some we thing you'll be interested in."
        }
        callback(null, responseJSON);
    };

    for (var i = 0; i < tag_slugs.length; i++) {
        q.push({ url: "http://public-knight.herokuapp.com/orgs/tag/" + tag_slugs[i] });
    }
};