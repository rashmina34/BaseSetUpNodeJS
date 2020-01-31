(() => {
    'use strict';

    module.exports = {
        message: {
            save: "News save successfully",
            update: "News updated successfully",
            notFound: "News not found",
            delete: "News delete successfully",
            conflict: "News already exist",
            error: "Error while fetching",
            validationErrMessage: {
                news_title: "News title is required",
                details: "News detail is required",
            },
            // config: {
            //     documentFilePath: '/private-uploads/news/',
            //     uploadPrefix: 'news',
            //     collectionName: 'News'
            // }
        }
    }
})();