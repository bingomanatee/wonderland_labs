(function () {

    var _dre = /http(s)?:\/\/([^\/]+)/;

    function _domain(url){
        if (_dre.test(url)){
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
            var out = _.object(tweet, ['text', 'created_at']);

            out.urls = _.reduce((tweet.entities.urls || []),
                function (out, url) {
                    if (url && url.expanded_url) {
                        out.push(url.expanded_url);
                    }
                    return out;
                },
                []);

            out.mentions = _.reduce((tweet.entities.user_mentions || []),
                function (out, mention) {
                    if (mention && mention.id && mention.screen_name){
                        out.push(mention.screen_name)
                    }
                    return out;
                },
                []);

            return out;
        });

        var by_url = _.reduce(simple_tweets, function(out, tweet){

            if (tweet.urls && tweet.urls.length){
                out = out.concat(_.map(tweet.urls, function(url){
                    return _.extend({
                        url: url,
                        domain: _domain(url)
                    }, tweet);
                }))
            } else {
                out.push(_.extend({url: '(no url)', domain: '(no domain)'}, tweet));
            }
            return out;

        }, []);

        return _.reduce(by_url, function (out, tweet) {

            if (tweet.mentions && tweet.mentions.length) {
                out = out.concat(_.map(tweet.mentions, function (mention) {
                    return _.defaults({mentions: mention}, tweet);
                }));
            } else {
                out.push(_.extend(tweet, {mentions: '(no mention)'}));
            }

            return out;

        }, []);
    }

    var tweetsApp = angular.module('tweets', ['routeService', 'ngGrid', 'ui.bootstrap']);

    angular.module('routeService', ['ngResource']).factory('Tweets',
        function ($resource) {
            return $resource('/tweets/:user_id', {}, {
                get: {method: 'GET'},
                query: {method: 'GET', isArray: true}
            });
        }).factory('UserAutocomplete', function ($resource) {
            return $resource("/admin/members/rest/member_autocomplete/:fragment/:provider", {provider: 'twitter'}, {
                query: {method: 'GET', isArray: true}
            })
        });

    function TweetsController($scope, $filter, $compile, Tweets, UserAutocomplete) {

        $scope.tweets = [];

        $scope.users = [];

        $scope.provider = 'twitter';

        $scope.$watch('user.oauthProfiles', function (profiles) {
            var twitter_profile = _.find(profiles, function(p){

                return p.provider == 'twitter';

            });

            if (twitter_profile){
                $scope.user_id = twitter_profile._id;
            } else {
                $scope.user_id = 0;
            }
        });

        $scope.$watch('user_id', function(uid){
            uid = parseInt(uid);
            if (!uid || isNaN(uid)) return;

            console.log('twitter uid = ', uid);
            Tweets.query({user_id: uid}, function(data){
                $scope.tweet_count = data.length;
                $scope.tweets = denorm_tweets(data);
            })
        })


        $scope.$watch('fragment', function (fragment) {
            console.log('user changed to ', fragment);
            if ((!fragment) || (fragment.length < 2)) {
                $scope.users = [];
            } else {
                UserAutocomplete.query(
                    {
                        fragment: fragment,
                        provider: 'twitter'
                    }
                    , function (users) {
                        console.log('found users with ', $scope.user, users);
                        $scope.users = users;
                    });
            }
        }, true);

        $scope.user = function(){
            if ($scope.fragment){
                return _.find($scope.users, function(u){
                    return u.displayName == $scope.fragment;
                })
            } else {
                return false;
            }
        };

        $scope.$watch('user()', function(u){
            console.log('profiles changed: ', u);
            if (!u || !_.isObject(u)){
                $scope.user_id = false;
                return;
            }

            var twitter_profile = _.find(u.oauthProfiles, function(p){
                return p.provider == 'twitter';
            });

            console.log('twitter_profile: ', twitter_profile);

            $scope.user_id = twitter_profile ? twitter_profile._id : false;

        }, true);

        $scope.urlGridOptions = {
            data: 'tweets',
            showFilter: true,
            showGroupPanel: true,
            columnDefs: [
                {field: 'text', displayName: 'Tweet', width: "****", groupable: false},
                {field: 'mentions', displayName: '@', width: '*'},
                {field: 'domain', displayName: 'Domain', width: "*"},
                {field: 'url', displayName: 'URL', width: "**", groupable: false},
                {field: 'created_at', dislayName: 'at', width: '**', cellFilter: "date:'MM dd, &apos;yy '"}
            ]

        };

    }

    TweetsController.$inject = ['$scope', '$filter', '$compile', 'Tweets', 'UserAutocomplete'];

    tweetsApp.controller('TweetsController', TweetsController);
})();

