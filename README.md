This is a specific website -- and a template for other hive sites.

INSTALL/REQUIREMENTS

the following resources need to be present:

* canvas
* gmp
* mongo 2.5+ (running on 27017

the following configuration files must be added to the root folder:

site_identity.json

``` json

{
	"domain_url": "http://wonderlandlabs.com",
	"domain":     "wonderlandlabs.com"
}

```

passport_config.json

``` json

{
"facebook_app_id": int,
"facebook_app_secret": "string",

"twitter_consumer_key": 	"string",
"twitter_consumer_secret": "string",

"twitter_access_token":	"string",
"twitter_access_token_secret":	"string"
}

```

article_config.json

``` json
{
	"article_root": "../../wll_content"
}

```

additionally, npm install must be run both in the root and in each frame with a package.json