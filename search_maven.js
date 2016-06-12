//       ______                ____        __
//      / ____/__  ____ ______/ __ )____  / /_
//     / / __/ _ \/ __ `/ ___/ __  / __ \/ __/
//    / /_/ /  __/ /_/ / /  / /_/ / /_/ / /_
//    \____/\___/\__,_/_/  /_____/\____/\__/
//

var request = require('request');

module.exports = {



    search: function(jar, callback) {

        var url = 'http://search.maven.org/solrsearch/select?q=' + jar + '&rows=12&wt=json'

        request({url: url, json: true}, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var ret = ''

                console.log('aaaa ' + body['response']['docs'].lenght);

                if (Object.keys(body['response']['docs']).length > 10) {
                    ret = 'Te muestro las 10 primeras entradas:\n';
                } else {
                    ret = 'Esto es lo que he encontrado:\n';
                }

                var i = 0;

                for(var myKey in body['response']['docs']) {
                   if (i >= 10){
                       break;
                   }

                   ret += (':small_blue_diamond:' + body['response']['docs'][myKey]['id'] + ':' + body['response']['docs'][myKey]['latestVersion'] + '\n');

                   i++;
                }

                callback(ret);
            } else {

                callback('ko');
            }
        })
    }
};
