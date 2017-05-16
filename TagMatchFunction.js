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

    var request = require('request');
    // this is the object we will return to Motion AI in the callback
    var responseJSON = {
        "response": "", // what the bot will respond with
        "continue": true, // "true" will result in Motion AI continuing the flow based on connections, whie "false" will make Motion AI hit this module again when the user replies
        "customPayload": "", // OPTIONAL: working data to examine in future calls to this function to keep track of state
        "quickReplies": null, // OPTIONAL: a JSON string array containing suggested/quick replies to display to the user .. i.e., ["Hello","World"]
        "cards": [], // OPTIONAL: a cards JSON object to display a carousel to the user (see docs)
        "customVars": null, // OPTIONAL: an object or stringified object with key-value pairs to set custom variables eg: {"key":"value"} or '{"key":"value"}'
        "nextModule": null // OPTIONAL: the ID of a module to follow this Node JS module
    }
    var tags = JSON.parse(customVars).tags.split(',');
    var tag_slugs = JSON.parse(customVars).tag_slugs.split(',');
    console.log(tags);
    console.log(tag_slugs);
    var url = "http://public-knight.herokuapp.com/tag/" + event.reply;
    request(url, function (error, response, body) {
        if (error) responseJSON.response("There was a problem.");
        console.log(body);
        var d = JSON.parse(body);
        
        if (d.valid === 1) {
            console.log(d);
            responseJSON.response = "Cool! So you're interested in " + ;
            responseJSON.customVars = {"tag_slug": d.tag_slug};
            responseJSON.nextModule = 653473;
        } else {
            responseJSON.response = "Sorry, I don't seem to understand " + event.reply ".";
            responseJSON.nextModule = 653483;
        }
        callback(null, responseJSON);
    });
};