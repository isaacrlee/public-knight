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

    // responseJSON.response = "Here are nearby organizations working to " + customVars.campaign + ". Click on any of them to learn more.";
    responseJSON.response = "Here are nearby organizations.";
    var regex = new RegExp('[ ,]+', 'g');
    var location = String(JSON.parse(event.customVars).location).split(regex);
    var zip = location[location.length-2];
    var url = "http://public-knight.herokuapp.com/orgs/zip/" + zip + "/10/tag/" + JSON.parse(event.customVars).tag;
    console.log(url);
    request(url, function (error, response, body) {
        if (error) responseJSON.response("There was a problem finding nearby orgniazations.");
        var orgs = JSON.parse(body);
        for (var i = 0; i < orgs.length; i++) {
            responseJSON.cards.push({
                cardTitle: orgs[i].org_name, // Card Title
                cardSubtitle: orgs[i].mission.substr(0, 50) + "...", // Card Subtitle
                cardImage: orgs[i].avatar_image_url, // Source URL for image
                cardLink: 'https://publicgood.com/org/' + orgs[i].org_slug, // Click through URL
                buttons: [{
                    buttonText: 'Check them out', // Button Call to Action
                    buttonType: 'module',
                    target: 'https://publicgood.com/org/' + orgs[i].org_slug// Text to send to bot, or URL
                }]
            });
        }
        callback(null, responseJSON);
    });

    // responseJSON.cards = [
    //     // Card 1
    //     {
    //         cardTitle: 'Chicago Public Education Fund', // Card Title
    //         cardSubtitle: 'Increase community investment and act as a catalyst in improving Chicago schools.', // Card Subtitle
    //         cardImage: 'http://peoplestribune.org/pt-news/wp-content/uploads/2014/08/pt.2014.09.04_education.jpg', // Source URL for image
    //         cardLink: 'https://www.thefundchicago.org', // Click through URL
    //         buttons: [{
    //             buttonText: 'Check out website', // Button Call to Action
    //             buttonType: 'module',
    //             target: 'This will get sent to the bot'// Text to send to bot, or URL
    //         }]
    //     },
    //     // Card 2
    //     {
    //         cardTitle: 'SOS Children Village',
    //         cardSubtitle: 'Care, education & health services provided to 2.2 million at-risk children and adults in 133 territories.',
    //         cardImage: 'http://www.cfegrants.org/wp-content/gallery/files/2012/02/About_2.png',
    //         cardLink: 'https://www.sosillinois.org/',
    //         buttons: [{
    //             buttonText: 'Check out website',
    //             buttonType: 'module',
    //             target: 'This will get sent to the bot',
    //         }]
    //     }
    // ]

    // callback to return data to Motion AI (must exist, or bot will not work)
    // callback(null, responseJSON);
};