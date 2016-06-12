//       ______                ____        __
//      / ____/__  ____ ______/ __ )____  / /_
//     / / __/ _ \/ __ `/ ___/ __  / __ \/ __/
//    / /_/ /  __/ /_/ / /  / /_/ / /_/ / /_
//    \____/\___/\__,_/_/  /_____/\____/\__/
//

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Chance = require('chance');
var Botkit = require('botkit');
var phrases = require('./phrases.js')
var search_maven = require('./search_maven.js')
var os = require('os');

var chance = new Chance();

var controller = Botkit.slackbot({
    debug: false,
    json_file_store: 'gearbot.db'
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['ayuda', 'puedes hacer', 'sabes hacer'],'direct_message,direct_mention,mention',function(bot, message) {

    if (message.text.search('traduc') >= 0) {

        bot.reply(message,'ok');
        bot.reply(message,'Puedo traducir de Español a Inglés o al revés');
        bot.reply(message,'Prueba a preguntarme así:');
        bot.reply(message,':small_blue_diamond:  ¿Cómo se dice \"pepinillos\" en inglés?');
        bot.reply(message,':small_blue_diamond:  Traduce \"ring\" a español');

    } else if (message.text.search('alias') >= 0) {

        bot.reply(message,'ok');
        bot.reply(message,'Puedo aprender a sustituir palabras o frases así:');
        bot.reply(message,':small_blue_diamond: Cuando diga nginx quiero decir busca la imágen Docker de Nginx');
        bot.reply(message,':small_blue_diamond: Cuando digo shipit quiero decir haz una release del job myApp');
        bot.reply(message,':small_blue_diamond: Dime todos mis alias');

    } else if (message.text.search('(docker|image|imagen|registry)') >= 0) {

        bot.reply(message,'ok');
        bot.reply(message,'Si quieres buscar imágenes Docker en nuestro Registry escríbeme así:');
        bot.reply(message,':small_blue_diamond: Busca la imágen \"consul\" en el registry');
        bot.reply(message,':small_blue_diamond: Quiero saber si hay un imágen docker de "nginx"');

    } else if (message.text.search('(jenkins|job)') >= 0) {

        bot.reply(message,'ok');
        bot.reply(message,'Puedo realizar varios comandos contra Jenkins de esta manera:');
        bot.reply(message,':small_blue_diamond: Haz un build del job \"myApp\"');
        bot.reply(message,':small_blue_diamond: Dime el último resultado del job \"myApp\"');

    } else if (message.text.search('(maven|jar|central)') >= 0) {

        bot.reply(message,'ok');
        bot.reply(message,'Para buscar un jar pregúntame así:');
        bot.reply(message,':small_blue_diamond: Busca el jar \"itext\" en Maven Central');
        bot.reply(message,':small_blue_diamond: Muéstrame las versiones del jar \"itext\"');

    } else {
        bot.reply(message,'Especifica un poquito más :kissing_heart:');
        bot.reply(message,'Puedo ayudarte con estos temas:');
        bot.reply(message,':small_blue_diamond: Aprender un alias');
        bot.reply(message,':small_blue_diamond: Traducir un texto');
        bot.reply(message,':small_blue_diamond: Buscar un jar en Maven Central');
        bot.reply(message,':small_blue_diamond: Buscar en el Docker Registry');
        bot.reply(message,':small_blue_diamond: Trabajar con Jenkins');
    }

});

controller.hears(['cuando dig(a|o) (.*) qui(ero|se) decir (.*)'],'direct_message,direct_mention,mention',function(bot, message) {

    var alias_matches = message.original_text.match(/cuando dig(a|o) (.*) qui(ero|se) decir (.*)/i);
    var alias_key = alias_matches[2];
    var alias_value = alias_matches[4];

    controller.storage.users.get(message.user,function(err, user) {

        if (user) {
            user.alias[alias_key] = alias_value;
        }
        else {
            user = {'id': message.user, 'alias':{[alias_key]:alias_value}};
        }

        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'ok');
            bot.reply(message, 'A partir de ahora \"' + alias_key + '\" = \"' + alias_value + '\"');
        });
    });

});

controller.hears(['(dime|muestra.*|lista.*) (.*) alias'],'direct_message,direct_mention,mention',function(bot, message) {

    console.log(message.original_text);

    controller.storage.users.get(message.user,function(err, user) {

        if (user) {
            bot.reply(message,'ok');
            bot.reply(message,'Estos son los alias que me has enseñado:');

            for(var alias_key in user.alias) {
                var alias_value = user.alias[alias_key];
                bot.reply(message,':small_blue_diamond: \"' + alias_key + '\" = \"' + alias_value + '\"');
            }
        }
        else {
            bot.reply(message,'no');
            bot.reply(message,'Aún no me has enseñado ningún alias :unamused:');
        }
    });

});

controller.hears(['traduc', 'se dice'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.reply(message,'no');

});

controller.hears(['maven', 'jar', 'central'],'direct_message,direct_mention,mention',function(bot, message) {

    var found = message.text.match("#{2}.*#{2}");

    if (found) {
        bot.reply(message,'ok');

        search_maven.search(found[0].replace(/#/g, ''), function (res) {

            bot.reply(message, res);
        });

    } else {
        bot.reply(message,'no');
    }

});

controller.hears(['docker', 'image', 'registry'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.reply(message,'no');

});

controller.hears(['jenkins', 'job'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.reply(message,'no');

});

controller.hears(['hola', 'hi', 'hello', 'buenas', 'que tal'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.reply(message,'hi');

});

controller.hears(['bye', 'ciao', 'adios', 'sta lueg', 'talue'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.reply(message,'bye');

});

controller.hears([':joy:', ':laughing:', 'jaja', '/giphy'],'ambient',function(bot, message) {

    if (chance.bool({likelihood: 25}))
    {
        bot.reply(message,'laugh');
    }

});

controller.middleware.receive.use(function(bot, message, next) {

    console.log('Before receive middleware ' + JSON.stringify(message, null, 4));

    if (message.type == 'message') {

        controller.storage.users.get(message.user,function(err, user) {

            if (user) {
                for(var alias_key in user.alias) {
                    var alias_value = user.alias[alias_key];
                    var re = new RegExp(alias_key, 'g');
                    message.text = message.text.replace(re, alias_value);
                }
            }

            message.original_text = message.text;

            message.text = message.text.toLowerCase();
            message.text = message.text.replace('/[àáâãäå]/g','a');
            message.text = message.text.replace('/[èéêë]/g','e');
            message.text = message.text.replace('/[ìíîï]/g)','i');
            message.text = message.text.replace('/[òóôõö]/g)','o');
            message.text = message.text.replace('/[ùúûü]/g','u');
            message.text = message.text.replace('"','##');
            message.text = message.text.replace('“','##');
            message.text = message.text.replace('”','##');

            if (message.subtype == 'channel_join') {

                bot.say( {
                    text: 'hi',
                    channel: message.channel
                });
            }

            console.log('After receive middleware ' + JSON.stringify(message, null, 4));

            next();

        });
    }
});

controller.middleware.send.use(function(bot, message, next) {

    //console.log('Send middleware ' + JSON.stringify(message, null, 4));

    switch (message.text) {
        case "ok":
            message.text = chance.weighted(phrases.ok, phrases.ok_weights);
            break;
        case "no":
            message.text = chance.weighted(phrases.no, phrases.no_weights);
            break;
        case "laugh":
            message.text = chance.weighted(phrases.laugh, phrases.laugh_weights);
            break;
        case "hi":
            message.text = chance.weighted(phrases.hi, phrases.hi_weights);
            break;
        case "bye":
            message.text = chance.weighted(phrases.bye, phrases.bye_weights);
            break;
        case "ko":
            message.text = chance.weighted(phrases.ko, phrases.ko_weights);
            break;
        default:
    }

    next();

});
