try {
    var Discord = require("discord.js");
} catch (e){
    console.log("Please run npm install and ensure it passes with no errors!");
    process.exit();
}

try {
    var yt = require("./youtube_plugin");
    var youtube_plugin = new yt();
} catch(e){
    console.log("couldn't load youtube plugin!\n"+e.stack);
}

try {
    var wa = require("./wolfram_plugin");
    var wolfram_plugin = new wa();
} catch(e){
    console.log("couldn't load wolfram plugin!\n"+e.stack);
}

// Get authentication data
try {
    var AuthDetails = require("./auth.json");
} catch (e){
    console.log("Please create an auth.json like auth.json.example with at least an email and password.");
    process.exit();
}

// Load custom permissions
var Permissions = {};
try{
    Permissions = require("./permissions.json");
} catch(e){}
Permissions.checkPermission = function (user,permission){
    try {
        var allowed = false;
        try{
            if(Permissions.global.hasOwnProperty(permission)){
                allowed = Permissions.global[permission] === true;
            }
        } catch(e){}
        try{
            if(Permissions.users[user.id].hasOwnProperty(permission)){
                allowed = Permissions.users[user.id][permission] === true;
            }
        } catch(e){}
        return allowed;
    } catch(e){}
    return false;
};

//load config data
var Config = {};
try{
    Config = require("./config.json");
} catch(e){ //no config file, use defaults
    Config.debug = false;
    Config.respondToInvalid = false;
}

var qs = require("querystring");

var htmlToText = require('html-to-text');

var giphy_config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/search",
    "permission": ["NORMAL"]
};

var validator = require('./validator');

var fs = require('fs');

var trump = require('./trump.json');

var Roll = require("roll");

var aliases;
var messagebox;

var ext = [".jpg"];

var commands = {
    "beep": {
        description: "responds boop, useful for checking if bot is alive",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, msg.sender+" boop!~");
        }
    },
    "boop": {
        description: "boop",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, msg.sender + " eat shit~");
        }
    },
    "join-server": {
        description: "joins the server it's invited to",
        usage: "<invite>",
        hidden: false,
        process: function(bot,msg,suffix) {
            console.log(bot.joinServer(suffix,function(error,server) {
                console.log("callback: " + arguments);
                if(error){
                    bot.sendMessage(msg.channel,"failed to join: " + error);
                } else {
                    console.log("Joined server " + server);
                    bot.sendMessage(msg.channel,"Successfully joined " + server);
                }
            }));
        }
    },
    "ratewaifu": {
        description: "rates the given waifu",
        usage: "<waifu>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (!suffix) {
                bot.sendMessage(msg.channel, "But you haven't named the waifu!~");
            }
            else {
                if (suffix.toLowerCase() == "holo") {
                    bot.sendMessage(msg.channel, "Oh! That's me! I rate myself a... 10/10!~");
                }
                else if (suffix.toLowerCase() == "asuka") {
                    bot.sendMessage(msg.channel, "Eugh! What a shit waifu! I rate Asuka a 0/10!~");
                }
                else if (suffix.toLowerCase() == "hayao" || suffix.toLowerCase() == "hayao miyazaki") {
                    bot.sendMessage(msg.channel, "'Anime was a mistake.' - Hayao Miyazaki");
                }
                else {
                    var value = Math.floor(Math.random() * (10 - 1)) + 1;
                    var waifu = suffix.toLowerCase();
                    var file = "waifus.json";

                    if (waifu.length <= 100) {
                        fs.readFile(file, "utf8", function(err, out) {
                            if (err) {
                                throw err;
                            }

                            var obj = JSON.parse(out);

                            if (!(waifu in obj)) {
                                obj[waifu] = {};
                                obj[waifu].rating = value;

                                fs.writeFile(file, JSON.stringify(obj, null, 4), function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    bot.sendMessage(msg.channel, "I rate " + capitalizeFirstLetter(waifu) + " a... " + value + "/10!~");
                                });

                            }
                            else {
                                var rating = obj[waifu].rating;

                                bot.sendMessage(msg.channel, "I rate " + capitalizeFirstLetter(waifu) + " a... " + rating + "/10!~");
                            }
                        });
                        //bot.sendMessage(msg.channel, "I rate " + capitalizeFirstLetter(suffix) + " a... " + value + "/10!~");
                    }
                    else {
                        bot.sendMessage(msg.channel, "But that waifu name is far too long!~");
                    }
                }
            }
        }
    },
    "ratehusbando": {
        description: "rates the given husbando",
        usage: "<husbando>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (!suffix) {
                bot.sendMessage(msg.channel, "You need to state your husbando~");
                return;
            }

            if (suffix.toLowerCase() == "postal") {
                bot.sendMessage(msg.channel, "postal? You have good tastes~");
                return;
            }
            else {
                bot.sendMessage(msg.channel, "You have shit tastes.");
                return;
            }
        }
    },
    "youtube": {
        description: "fetches a youtube video matching given tags",
        usage: "<tags>",
        hidden: false,
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, "I found something!~");
            youtube_plugin.respond(suffix, msg.channel, bot);
        }
    },
    "wiki": {
        description: "fetches the first wiki result from wikipedia",
        usage: "<tags>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var query = suffix;
            if (!query) {
                bot.sendMessage(msg.channel, "Here's how to use this command~: ~wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query, 1).then(function(data) {
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        var sumText = summary.toString().split('\n');
                        var continuation = function() {
                            var paragraph = sumText.shift();
                            if (paragraph) {
                                bot.sendMessage(msg.channel, "Here you go!~\n" + paragraph);
                            }
                        };
                        continuation();
                    });
                });
            }, function(err) {
                bot.sendMessage(msg.channel, "Woops! Error!~\n" + err);
            });
        }
    },
    "urbandictionary": {
        description: "fetches some shitty definition from ud",
        usage: "<word>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var request = require('request');
            request('http://api.urbandictionary.com/v0/define?term=' + suffix, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var uD = JSON.parse(body);
                    if (uD.result_type !== "no_results") {
                        bot.sendMessage(msg.channel, "Here's a definition!~\n" + suffix + ": " + uD.list[0].definition + " \"" + uD.list[0].example + "\"");
                    }
                    else {
                        bot.sendMessage(msg.channel, suffix + " is so fucked that even Urban Dictionary can't define it!~");
                    }
                }
            });
        }
    },
    "xkcd": {
    description: "grabs a given xkcd comic",
    usage: "<id>",
    hidden: false,
    process: function(bot, msg, suffix) {
        var request = require('request');
        request('http://xkcd.com/info.0.json', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var xkcdInfo = JSON.parse(body);
                if (suffix) {
                    var isnum = /^\d+$/.test(suffix);
                    if (isnum) {
                        if ([suffix] < xkcdInfo.num) {
                            request('http://xkcd.com/' + suffix + '/info.0.json', function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    xkcdInfo = JSON.parse(body);
                                    bot.sendMessage(msg.channel, "Here you go!~\n" + xkcdInfo.img);
                                } else {
                                    Logger.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
                                }
                            });
                        } else {
                            bot.sendMessage(msg.channel, "There are only " + xkcdInfo.num + " xkcd comics!~");
                        }
                    } else {
                        bot.sendMessage(msg.channel, xkcdInfo.img);
                    }
                } else {
                    var xkcdRandom = Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
                    request('http://xkcd.com/' + xkcdRandom + '/info.0.json', function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            xkcdInfo = JSON.parse(body);
                            bot.sendMessage(msg.channel, "Here you go!~\n" + xkcdInfo.img);
                        } else {
                            Logger.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
                        }
                    });
                }

                } else {
                    Logger.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
                }
            });
        }
    },
    "hehe~": {
        description: "~hehe~",
        usage: "<you don't>",
        hidden: true,
        process: function(bot, msg) {
            var bot_permissions = msg.channel.permissionsOf(bot.user);
            if (Permissions.checkPermission(msg.author, "hehe")) {
                bot.sendFile(msg.channel, "./hehe.png");
                if (msg.channel.server){
                    if (bot_permissions.hasPermission("manageMessages")) {
                        bot.deleteMessage(msg);
                        return;
                    }
                    else {
                        bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!~*");
                    }
                }
            }
            else {
                bot.sendMessage(msg.channel, "Hehe, no~");
                if (bot_permissions.hasPermission("manageMessages")) {
                    bot.deleteMessage(msg);
                    return;
                }
                else {
                    bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!~*");
                }
            }
        }
    },
    "gif": {
        description: "fetches a gif from giphy",
        usage: "<tags>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var tags = suffix.split(" ");
            get_gif(tags, function(id) {
                if (typeof id !== "undefined") {
                    bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
                } else {
                    bot.sendMessage(msg.channel, "Invalid tags, try something different. For example, something that exists [Tags: " + (tags ? tags : "Random GIF") + "]");
                }
            });
        }
    },
    "wolfram": {
        description: "gives results from wolframalpha using search terms",
        usage: "<search terms>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if(!suffix){
                bot.sendMessage(msg.channel,"Usage: !wolfram <search terms> (Ex. !wolfram integrate 4x)");
            }
            wolfram_plugin.respond(suffix,msg.channel,bot);
        }
    },
    "whois": {
        description: "gets user info",
        usage: "<@user>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (!msg.channel.server) {
                bot.sendMessage(msg.author, "Sorry, but I can't do that in a DM~");
                return;
            }
            if (msg.mentions.length === 0) {
                bot.sendMessage(msg.channel, "Please mention the user that you want to get information of~");
                return;
            }

            console.log(msg.mentions);

            msg.mentions.map(function(user) {
                var msgArray = [];

                console.log("works?");

                if (user.avatarURL === null) {
                    msgArray.push("Requested user: '" + user.username + "'");
                    msgArray.push("ID: '" + user.id + "'");
                    msgArray.push("Status: '" + user.status + "'");
                    msgArray.push("Roles: " + msg.channel.server.rolesOfUser(user)[0].name);
                    bot.sendMessage(msg.channel, msgArray);
                    return;
                }
                else {
                    if (user.username == "HoloBot") {
                        msgArray.push("Ooh! That's me!~");
                    }
                    msgArray.push("Requested user: '" + user.username + "'");
                    msgArray.push("ID: '" + user.id + "'");
                    msgArray.push("Status: '" + user.status + "'");
                    msgArray.push("Roles: " + msg.channel.server.rolesOfUser(user)[0].name);
                    msgArray.push("Avatar: " + user.avatarURL);
                    bot.sendMessage(msg.channel, msgArray);
                    return;
                }
            });
        }
    },
    "bancount": {
        description: "what's the deal with meanwhile's ban count?",
        hidden: false,
        process: function(bot, msg) {
            fs.readFile('bancount.txt', function(err, data){
                bot.sendMessage(msg.channel, "meanwhile has been banned " + data + " times!~");
            });
        }
    },
    "loadsa": {
        description: "oi you! shut your mouth and look at my wad!",
        hidden: true,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "http://cash4ads.github.io");
        }
    },
    "ban": {
        description: "ban those punks who posted rebecca black and justin bieber",
        usage: "<@user>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (msg.channel.permissionsOf(msg.sender).hasPermission("manageRoles")) {
                var bot_permissions = msg.channel.permissionsOf(bot.user);
                if (bot_permissions.hasPermission("manageRoles")) {
                    if (!msg.channel.server) {
                        bot.sendMessage(msg.author, "Sorry, but I can't do that in a DM~");
                        return;
                    }
                    if (msg.mentions.length === 0) {
                        bot.sendMessage(msg.channel, "Please mention the user that you want to get rid of~");
                        return;
                    }
                    msg.mentions.map(function(user) {
                        if (msg.channel.server.rolesOfUser(user)[0].name == "Members") {
                            if (user.id == 104374046254186496) {
                                var bancount;
                                var newcount;

                                fs.readFile('bancount.txt', function(err, data){
                                    bancount = parseInt(data);

                                    newcount = bancount + 1;

                                    console.log(newcount);

                                    fs.writeFile('bancount.txt', newcount, function(err) {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                });
                            }

                            bot.removeMemberFromRole(user, msg.channel.server.roles[1], function(error) {
                                if (error !== null) {
                                    bot.sendMessage(msg.channel, "That user isn't in the Members role!~");
                                }

                                
                            });
                            setTimeout(function() { 
                                bot.addMemberToRole(user, msg.channel.server.roles[4], function(error) {
                                    if (error !== null) {
                                        bot.sendMessage(msg.channel, "That user appears to already be banned!~");
                                    }

                                    bot.sendMessage(msg.channel, user.username + " has been banned by " + msg.author + "!~");
                                });
                            }, 500);
                            return;
                        }
                        else {
                            //bot.sendMessage(msg.channel, msg.author +  ", that user is most likely not in this channel!~");
                        }
                    });
                return;
                }
                else {
                    bot.sendMessage(msg.channel, "Sorry, but I need permissions to manage roles to ban people!~");
                }
            }
            else {
                bot.sendMessage(msg.channel, "Nice try, but you haven't got permission to ban people!~");
            }
        }
    },
    "unban": {
        description: "unban those punks who posted rebecca black and justin bieber, but why would you want to?",
        usage: "<@user>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (msg.channel.permissionsOf(msg.sender).hasPermission("manageRoles")) {
                var bot_permissions = msg.channel.permissionsOf(bot.user);
                if (bot_permissions.hasPermission("manageRoles")) {
                    if (!msg.channel.server) {
                        bot.sendMessage(msg.author, "Sorry, but I can't do that in a DM~");
                        return;
                    }
                    if (msg.mentions.length === 0) {
                        bot.sendMessage(msg.channel, "Please mention the user that you want to bring back~");
                        return;
                    }
                    msg.mentions.map(function(user) {
                        if (msg.channel.server.rolesOfUser(user)[0].name == "BANNED") {
                            bot.removeMemberFromRole(user, msg.channel.server.roles[4], function(error) {
                                if (error !== null) {
                                    bot.sendMessage(msg.channel, "That user isn't banned!~");
                                }

                                //bot.sendMessage(msg.channel, msg.author +  ", that user is most likely not in this channel!~")
                            });
                            setTimeout(function() { 
                                bot.addMemberToRole(user, msg.channel.server.roles[1], function(error) {
                                    if (error !== null) {
                                        bot.sendMessage(msg.channel, "That user appears to already be unbanned!~");
                                    }

                                    bot.sendMessage(msg.channel, user.username + " has been unbanned by " + msg.author + "!~");
                                });
                            }, 500);
                            return;
                        }
                        else {
                            //bot.sendMessage(msg.channel, msg.author +  ", that user is most likely not in this channel!~")
                        }
                    });
                return;
                }
                else {
                    bot.sendMessage(msg.channel, "Sorry, but I need permissions to manage roles to ban people!~");
                }
            }
            else {
                bot.sendMessage(msg.channel, "Nice try, but you haven't got permission to ban people!~");
            }
        }
    },
    "eval": {
        description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission',
        usage: "<js code>",
        hidden: true,
        process: function(bot, msg, suffix) {
            if (Permissions.checkPermission(msg.author, "eval")) {
                bot.sendMessage(msg.channel, eval(suffix,bot));
            } else {
                bot.sendMessage(msg.channel, msg.author + " doesn't have permission to execute eval!");
            }
        }
    },
    "purge": {
        description: "purge a given number of messages",
        usage: "<number> <force>",
        hidden: false,
        process: function(bot, msg, suffix) {
            if (!msg.channel.server) {
                bot.sendMessage(msg.channel, "Sorry, but I can't do that in a DM~");
                return;
            }

            if (!suffix) {
                bot.sendMessage(msg.channel, "You need to specify the number of messages you want me to purge!~");
                return;
            }

            if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
                bot.sendMessage(msg.channel, "Nice try, but you haven't got permission to purge the logs!~");
                return;
            }

            if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
                bot.sendMessage(msg.channel, "Oh dear, it would seem I haven't got permission to purge the logs!~");
                return;
            }
            
            if (suffix.split(" ")[0] > 100) {
                bot.sendMessage(msg.channel, "Sorry, but I can't purge more than 100 messages, and only 20 messages without 'force'~");
                return;
            }

            if (suffix.split(" ")[0] > 20 && suffix.split(" ")[1] != "force") {
                bot.sendMessage(msg.channel, "Sorry, but purging more than 20 messages isn't possible without 'force'~");
                return;
            }

            if (suffix.split(" ")[0] == "force") {
                bot.sendMessage(msg.channel, "The 'force' argument goes at the end of the command, silly!~");
                return;
            }

            bot.getChannelLogs(msg.channel, suffix.split(" ")[0], function(err, msgs) {
                if (err) {
                    bot.sendMessage(msg.channel, "Woops! I seem to have encountered a problem with fetching the logs!~");
                    return;
                }
                else {
                    var purge = msgs.length;
                    var delcount = 0;

                    for (msg of msgs) {
                        bot.deleteMessage(msg);
                        purge--;
                        delcount++;

                        if (purge === 0) {
                            bot.sendMessage(msg.channel, "Whew! I've purged " + delcount + " messages!~");
                            return;
                        }
                    }
                }
            });
        }
    },
    "github": {
        description: "links the github page for those wanting to fucking CRY at my terrible practices",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "Welp, it's your funeral~\nhttps://github.com/NightmareX91/HoloBot");
        }
    },
    "dev": {
        description: "who's the developer of this weebshit bot?",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "meanwhile is responsible for my development, but it couldn't have been done without chalda and steamingmutt!~\n" +
                "If you want to complain about something, bitch at meanwhile please!~");
        }
    },
    "restart": {
        description: "quick restart command for meanwhile",
        hidden: true,
        process: function(bot, msg) {
            if (Permissions.checkPermission(msg.author, "hehe")) {
                bot.sendMessage(msg.channel, "Restarting! I won't be long!~");
                setTimeout(function(){
                    process.exit(1);
                }, 500);
            }
            else {
                bot.sendMessage(msg.channel, "Nice try, but you haven't got permission to restart me!~");
                return;
            }
        }
    },
    "burger": {
        description: "a burger to surpass Burger King",
        hidden: false,
        process: function(bot, msg) {
            var path = require("path");
            var imgArray = [];

            fs.readdir("./burgers", function(err, dirContents) {
                for (var i = 0; i < dirContents.length; i++) {
                    for (var o = 0; o < ext.length; o++) {
                        if (path.extname(dirContents[i]) === ext[o]) {
                            imgArray.push(dirContents[i]);
                        }
                    }
                }

                var random = Math.floor(Math.random() * ((imgArray.length + 1) - 1)) + 1;
                    
                bot.sendFile(msg.channel, "./burgers/" + random + ".jpg");

                console.log("burger number " + random);
            });
        }
    },
    "roll": {
        description: "rolls a dice",
        usage: "<1d6> <%> <b>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var roll = new Roll();
            var str = suffix.split(" ").join("");
            var valid = roll.validate(str);

            if (!suffix) {
                bot.sendMessage(msg.channel, "You need to input a dice roll!~");
                return;
            }

            if (!valid) {
                bot.sendMessage(msg.channel, "That roll was invalid!~");
                return;
            }

            var msgArray = [];
            var result = roll.roll(str);

            msgArray.push("Input: " + str);
            msgArray.push("Result: " + result.result);

            bot.sendMessage(msg.channel, msgArray);
        }
    },
    "superpower": {
        description: "gives a superpower to you or a random user",
        usage: "<@user>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var request = require("request");
            var id = "48473";
            var powerlisting = "http://www.wikia.com/api/v1/Wikis/Details?ids=" + id;
            var power;
            var capabilities;

            request("http://powerlisting.wikia.com/wiki/Special:Random", function(err, response, body) {
                if (err) {
                    throw err;
                }

                if (response.statusCode === 200) {
                    console.log(response.request.uri.path);
                    console.log(response.request.uri.host);
    
                    var str1 = response.request.uri.path;
                    var str2 = str1.replace("\/wiki\/", "");
    
                    console.log(str2);
    
                    request("http://www.powerlisting.wikia.com/api/v1/Articles/List?expand=1&limit=1&offset=" + str2, function(err, response, body) {
                        if (err) {
                            throw err;
                        }
    
                        if (response.statusCode === 200) {
                            console.log(JSON.parse(body));

                            var wikijson = JSON.parse(body);
                            var id = wikijson.items[0].id;
                                
                            power = wikijson.items[0].title;

                            console.log(id);

                            request("http://www.powerlisting.wikia.com/api/v1/Articles/AsSimpleJson?id=" + id, function(err, response, body) {
                                if (err) {
                                    throw err;
                                }

                                if (response.statusCode === 200) {
                                    console.log(JSON.parse(body));

                                    var wikijson = JSON.parse(body).sections;

                                    console.log(wikijson);

                                    for (var i = 0; i < wikijson.length; i++) {
                                        if (wikijson[i].title === "Capabilities" || wikijson[i].title === "Capability") {
                                            console.log(wikijson[i].content);
                                            console.log(wikijson[i].content[0].text);

                                            capabilities = wikijson[i].content[0].text;
                                        }
                                    }

                                    if (!suffix) {
                                        var msgArray = [];

                                        msgArray.push(msg.sender + "'s superpower is: " + power + "!");
                                        msgArray.push(capabilities);

                                        bot.sendMessage(msg.channel, msgArray);
                                        return;
                                    }
                                    else if (suffix) {
                                        if (msg.mentions.length === 0) {
                                            bot.sendMessage(msg.channel, "Please mention the user you want to give a superpower to!~");
                                            return;
                                        }

                                        msg.mentions.map(function(user) {
                                            var msgArray = [];

                                            msgArray.push(user + "'s superpower is: " + power + "!");
                                            msgArray.push(capabilities);

                                            bot.sendMessage(msg.channel, msgArray);
                                            return;
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    "dashcount": {
        description: "how many suckas used a dash instead of a tilde?",
        hidden: false,
        process: function(bot, msg) {
            fs.readFile("tilde.txt", function(err, data) {
                bot.sendMessage(msg.channel, data + " suckers mistook the tilde for a dash!~");
            });
        }
    },
    "roaste": {
        description: "d",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "http://www.youtube.com/watch?v=_tWC5qtfby4");
        }
    },
    "stop": {
        description: "IT'S TIME TO STOP",
        hidden: false,
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "http://www.youtube.com/watch?v=2k0SmqbBIpQ");
        }
    },
    "e": {
        description: "it's a mystery",
        hidden: true,
        process: function(bot, msg, suffix) {
            if (Permissions.checkPermission(msg.author, "hehe")) {
                if (msg.channel.server){
                    var bot_permissions = msg.channel.permissionsOf(bot.user);
                    bot.sendMessage(msg.channel, suffix);

                    if (bot_permissions.hasPermission("manageMessages")) {
                        bot.deleteMessage(msg);
                        return;
                    }
                    else {
                        console.log("denied");
                    }
                }
            }
            else
            {
                return;
            }
        }
    },
    "trump": {
        description: "quote a trump",
        hidden: false,
        process: function(bot, msg) {
            var randtrump = Math.floor(Math.random() * ((trump.trump.length + 1)));

            bot.sendMessage(msg.channel, "*\"" + trump.trump[randtrump].quote + "\" - Donald Trump*");
        }
    },
    "gunporn": {
        description: "a weapon to surpass metal gear",
        hidden: false,
        process: function(bot, msg) {
            var path = require("path");
            var imgArray = [];

            fs.readdir("./gunporn", function(err, dirContents) {
                for (var i = 0; i < dirContents.length; i++) {
                    for (var o = 0; o < ext.length; o++) {
                        if (path.extname(dirContents[i]) === ext[o]) {
                            imgArray.push(dirContents[i]);
                        }
                    }
                }

                var random = Math.floor(Math.random() * ((imgArray.length + 1) - 1)) + 1;
                    
                bot.sendFile(msg.channel, "./gunporn/" + random + ".jpg");

                console.log("gunporn number " + random);
            });
        }
    },
    "ratelaifu": {
        description: "the official user rating system",
        usage: "<@user>",
        hidden: false,
        process: function(bot, msg, suffix) {
            var value = Math.floor(Math.random() * ((10 + 1) - 1)) + 1;
            var file = "laifus.json";

            if (!suffix) {
                fs.readFile(file, "utf8", function(err, out) {
                    if (err) {
                        throw err;
                    }
                    
                    var obj = JSON.parse(out);

                    if (!(msg.sender in obj)) {
                        obj[msg.sender] = {};
                        obj[msg.sender].rating = value;

                        fs.writeFile(file, JSON.stringify(obj, null, 4), function(err) {
                            if (err) {
                                throw err;
                            }
                            bot.sendMessage(msg.channel, "I rate " + msg.sender + "'s laifu a... " + value + "/10!~");
                        });
                    }
                    else {
                        var rating = obj[msg.sender].rating;

                        bot.sendMessage(msg.channel, "I rate " + msg.sender + "'s laifu a... " + rating + "/10!~");
                    }
                });
            }
            else {
                if (msg.mentions.length === 0) {
                    bot.sendMessage(msg.channel, "Please mention the user who's laifu you want to rate!~");
                    return;
                }

                msg.mentions.map(function(user) {
                    fs.readFile(file, "utf8", function(err, out) {
                        if (err) {
                            throw err;
                        }
                        
                        var obj = JSON.parse(out);
    
                            if (!(user in obj)) {
                                obj[user] = {};
                                obj[user].rating = value;
    
                                fs.writeFile(file, JSON.stringify(obj, null, 4), function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    bot.sendMessage(msg.channel, "I rate " + user + "'s laifu a... " + value + "/10!~");
                                });
                            }
                            else {
                                var rating = obj[user].rating;
    
                                bot.sendMessage(msg.channel, "I rate " + user + "'s laifu a... " + rating + "/10!~");
                        }
                    });
                });
            }
        }
    }
};

try{
    aliases = require("./alias.json");
} catch(e) {
    //No aliases defined
    aliases = {};
}

try{
    messagebox = require("./messagebox.json");
} catch(e) {
    //no stored messages
    messagebox = {};
}
function updateMessagebox(){
    require("fs").writeFile("./messagebox.json",JSON.stringify(messagebox,null,2), null);
}

var fs = require('fs'),
    path = require('path');
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


var bot = new Discord.Client();

bot.on("ready", function () {
    console.log("Ready to begin! Serving in " + bot.channels.length + " channels~");
    bot.setPlayingGame("with her tail~");
});

bot.on("disconnected", function () {

    console.log("Disconnected!");
    process.exit(1); //exit node.js with an error
    
});

bot.on("message", function (msg) {
    //check if message is a command
    if(msg.author.id != bot.user.id && (msg.content[0] === '~' || msg.content.indexOf(bot.user.mention()) === 0)){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
        var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) === 0){
            try {
                cmdTxt = msg.content.split(" ")[1];
                suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
            } catch(e){ //no command
                bot.sendMessage(msg.channel,"Yes?");
                return;
            }
        }
        alias = aliases[cmdTxt];
        if(alias){
            cmdTxt = alias[0];
            suffix = alias[1] + " " + suffix;
        }
        var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
            bot.sendMessage(msg.author,"Available Commands:", function(){
                var msgArray = [];

                for(var cmd in commands) {
                    var info = "~" + cmd;
                    var usage = commands[cmd].usage;
                    var hidden = commands[cmd].hidden;

                    if(usage){
                        info += " " + usage;
                    }
                    var description = commands[cmd].description;
                    if(description){
                        info += "\n\t" + description;
                    }

                    if (!hidden) {
                        msgArray.push(info);
                    }
                }

                bot.sendMessage(msg.author, msgArray);
            });
            bot.sendMessage(msg.channel, msg.sender + ", I've sent you a DM with a list of my commands!~");
        }
        else if(cmd) {
            try{
                cmd.process(bot,msg,suffix);
            } catch(e){
                if(Config.debug){
                    bot.sendMessage(msg.channel, "command " + cmdTxt + " failed :(\n" + e.stack);
                }
            }
        } else {
            if(Config.respondToInvalid){
                bot.sendMessage(msg.channel, "Invalid command " + cmdTxt);
            }
        }
    } else if (msg.author.id != bot.user.id && (msg.content[0] === "-")) {
        var tildecount;
        var newcount;

        fs.readFile('tilde.txt', function(err, data){
            tildecount = parseInt(data);

            newcount = tildecount + 1;

            console.log(tildecount);

            bot.sendMessage(msg.channel, "Tilde! Not dash! Current dash count: " + newcount + "~");

            fs.writeFile('tilde.txt', newcount, function(err) {
                if (err) {
                    throw err;
                }
            });
        });
        return;
    } else {
        //message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }
        
        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                bot.sendMessage(msg.channel,msg.author + ", you called?~");
        }
    }
});
 

//Log user status changes
bot.on("presence", function(user,status,gameId) {
    //if(status === "online"){
    //console.log("presence update");
    console.log(user+" went "+status);
    //}
    try{
    if(status != 'offline'){
        if(messagebox.hasOwnProperty(user.id)){
            console.log("found message for " + user.id);
            var message = messagebox[user.id];
            var channel = bot.channels.get("id",message.channel);
            delete messagebox[user.id];
            updateMessagebox();
            bot.sendMessage(channel,message.content);
        }
    }
    }catch(e){}
});

function get_gif(tags, func) {
        //limit=1 will only return 1 gif
        var params = {
            "api_key": giphy_config.api_key,
            "rating": giphy_config.rating,
            "format": "json",
            "limit": 1
        };
        var query = qs.stringify(params);

        if (tags !== null) {
            query += "&q=" + tags.join('+');
        }

        //wouldnt see request lib if defined at the top for some reason:\
        var request = require("request");
        //console.log(query)

        request(giphy_config.url + "?" + query, function (error, response, body) {
            //console.log(arguments)
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
                console.log(error);
                //console.log(response)
            }
            else {
                var responseObj = JSON.parse(body);
                console.log(responseObj.data[0]);
                if(responseObj.data.length){
                    func(responseObj.data[0].id);
                } else {
                    func(undefined);
                }
            }
        }.bind(this));
    }

bot.login(AuthDetails.email, AuthDetails.password);