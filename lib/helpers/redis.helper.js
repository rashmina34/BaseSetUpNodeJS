((redisConnector) => {
    const redis = require('redis');
    const redisClient = redis.createClient();

    const redisconfig = require('../configs/redis.config');

    redisConnector.init = async (app) => {

        const redisClient = redis.createClient({
            host: redisconfig.host,
            port: redisconfig.port
        });
        await redisClient.on('ready', function () {
            console.log("Redis Server connected successfully");
        });

        await redisClient.on('error', function () {
            console.log("Error in Reddis Server Connection");
        });
    }


    //Set Redis server
    redisConnector.saveToRedis = (key, data) => {
        // let doc = JSON.parse(reply);
        redisClient.set(key, JSON.stringify(data));

    }

    //GET Redis server
    redisConnector.fetchData = (key) => {
        return new Promise((resolve, reject) => {
            try {
                redisClient.get(key, (err, data) => {
                    if (err) reject(err);


                    resolve(data);
                })
            } catch (err) {
                reject(err);
            }
        })
    }

    //EXPIRE
    redisConnector.expireKey = (key, num) => {
        return redisClient.expire(key, num);
    }



    //DeleteKeys 
    redisConnector.delkey = (id) => {
        return redisClient.del(id, function (err, reply) {
            console.log("reply==>", reply);
        });
    }

    //get redis 
})(module.exports);