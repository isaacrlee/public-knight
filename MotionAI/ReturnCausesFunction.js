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
    var tagJSON;
    var url = "http://public-knight.herokuapp.com/tag/" + event.reply;
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
    request(url, function (error, response, body) {
        if (error) {
            responseJSON.response("There was a problem.");
            callback(null, responseJSON);    
        }
        tagJSON = JSON.parse(body);
        if (tagJSON.valid === 1) {
            responseJSON.response = "Cool! So you're interested in " + tagJSON.tag + "?";
            responseJSON.customVars = {"pot_tag": tagJSON.tag, "pot_tag_slug": tagJSON.tag_slug};
            responseJSON.quickReplies = ["Yes", "No"];
        } else {
            responseJSON.response = "Sorry, I don't seem to understand " + event.reply + ". Tell us a another philanthropic cause you're passionate about. (e.g. the environment, protecting animals, education)";
            responseJSON.nextModule = 739327;
        }
        callback(null, responseJSON);
    });
};