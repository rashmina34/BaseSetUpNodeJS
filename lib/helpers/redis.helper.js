((redisConnector) => {
    const redis = require('redis');
    const redisClient = redis.createClient();


    redisConnector.init = async (app) => {

        const redisClient = redis.createClient({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        });
        await redisClient.on('ready', function () {
            console.log("Redis Server connected successfully");
        });

        await redisClient.on('error', function () {
            console.log("Error in Reddis Server Connection");
        });
    }


    redisConnector.saveToRedis = (key, data) => {
        redisClient.set(key, JSON.stringify(data));

    }

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

    redisConnector.expireKey = (key, num) => {
        return redisClient.expire(key, num);
    }



    redisConnector.delkey = (id) => {
        return redisClient.del(id, function (err, reply) {
            console.log("reply==>", reply);
        });
    }

})(module.exports);
