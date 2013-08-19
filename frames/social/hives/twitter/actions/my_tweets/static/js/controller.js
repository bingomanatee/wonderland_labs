(function () {

    var _dre = /http(s)?:\/\/([^\/]+)/;

    function _domain(url) {
        if (_dre.test(url)) {
            return _dre.exec(url)[2];
        } else {
            return url.split('/')[2];
        }

    }

    /**
     * simplifies entities' urls and mentions
     *
     * @param tweets
     * @returns {*}
     */
    function denorm_tweets(tweets) {
        var simple_tweets = _.map(tweets, function (tweet) {
            var out = _.pick(tweet, ['text', '_id', 'created_at']);

            out.urls = _.reduce((tweet.entities.urls || []),
                function (out, url) {
                    if (url && url.expanded_url) {
                        out.push(url.expanded_url);
                    }
                    return out;
                },
                []);
            out.short_urls = _.reduce((tweet.entities.urls || []),
                function (out, url) {
                    if (url && url.expanded_url) {
                        out.push(url.expanded_url.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, ''));
                    }
                    return out;
                },
                []);

            // controlling date to
            var m = moment(tweet.created_at).startOf('week');

            out.created_at = m.toDate();

            out.mentions = _.reduce((tweet.entities.user_mentions || []),
                function (out, mention) {
                    if (mention && mention.id && mention.screen_name) {
                        out.push(mention.screen_name)
                    }
                    return out;
                },
                []);


            return out;
        });

        var by_url = _.reduce(simple_tweets, function (out, tweet) {

            if (tweet.urls && tweet.urls.length) {
                out = out.concat(_.map(_.uniq(tweet.urls), function (url, i) {
                    return _.extend({
                        url: url,
                        short_url: tweet.short_urls[i],
                        domain: _domain(url)
                    }, tweet);
                }))
            } else {
                out.push(_.extend({url: '(no url)', domain: ''}, tweet));
            }
            return out;

        }, []);

        var by_mentions = _.reduce(by_url, function (out, tweet) {

            if (tweet.mentions && tweet.mentions.length) {
                out = out.concat(_.map(_.uniq(tweet.mentions), function (mention) {
                    return _.defaults({mentions: mention}, tweet);
                }));
            } else {
                out.push(_.extend(tweet, {mentions: ''}));
            }

            return out;

        }, []);

        return by_mentions.map(function (tweet) {

            var regex = new RegExp('(RT )?@' + tweet.mentions + '[\s]*');
            if (regex.test(tweet.text)) {
                var match = regex.exec(tweet.text);
                if (!match[1]) match[1] = '';
                tweet.text_short = tweet.text.replace(regex, match[1] + '...');
            } else {
                tweet.text_short = tweet.text;
            }

            return tweet;

        })
    }

    var tweetsApp = angular.module('tweets', ['routeService', 'ngGrid', 'ui.bootstrap']);

    angular.module('routeService', ['ngResource']).factory('Tweets',
        function ($resource) {
            return $resource('/tweets/:user_id', {}, {
                get: {method: 'GET'},
                query: {method: 'GET', isArray: true}
            });
        })

    function TweetsController($scope, $filter, $compile, Tweets, $window) {

        $scope.tweets = [];

        $scope.users = [];

        $scope.provider = 'twitter';

        $scope.$watch('user.oauthProfiles', function (profiles) {
            var twitter_profile = _.find(profiles, function (p) {

                return p.provider == 'twitter';

            });

            if (twitter_profile) {
                $scope.user_id = twitter_profile._id;
            } else {
                $scope.user_id = 0;
            }
        });

        $scope.user = function () {
            if ($scope.fragment) {
                return _.find($scope.users, function (u) {
                    return u.displayName == $scope.fragment;
                })
            } else {
                return false;
            }
        };

        $scope.$watch('user()', function (u) {
            // console.log('profiles changed: ', u);
            if (!u || !_.isObject(u)) {
                $scope.user_id = false;
                return;
            }

            var twitter_profile = _.find(u.oauthProfiles, function (p) {
                return p.provider == 'twitter';
            });

            $scope.user_id = twitter_profile ? twitter_profile._id : false;

        }, true);

        $scope.active_tweet = [];

        $scope.urlGridOptions = {
            data: 'tweets',
            showFilter: true,
            showGroupPanel: true,
            selectedItems: $scope.active_tweet,
            multiSelect: false,
            columnDefs: [
                {field: 'created_at', displayName: 'at', width: '*', cellFilter: "date:'MMM d, yy '"},
                {field: 'mentions', displayName: '@', width: '*'},
                {field: 'text_short', displayName: 'Tweet', width: "*******", groupable: false},
                {field: 'domain', displayName: 'Domain', width: "*"},
                {field: 'short_url', displayName: 'URL', width: "**", groupable: false}
            ]

        };

        $scope.$watch('active_tweet', function (at) {
            if (at && at.length) {
                console.log('tweet: ', at[0]);

                $('#tweet_embed').load('/tweet_embed/' + at[0]._id)
            }
        }, true);

        Tweets.query({user_id: $window.twitter_user_id}, function (data) {
            $scope.tweet_count = data.length;
            $scope.tweets = denorm_tweets(data);
        });

        $('#progress_bar').animate({
            width: '98%'
        }, 10000)
    }

    TweetsController.$inject = ['$scope', '$filter', '$compile', 'Tweets', '$window'];

    tweetsApp.controller('TweetsController', TweetsController);
})();

