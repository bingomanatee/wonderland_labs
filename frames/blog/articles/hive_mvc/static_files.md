Unlike conventional Express websites that use a single folder for all client side resources (static files), Express allows you to have innumerable static folders, allowing you to store javascript and CSS specific to a particular action inside the action folder. 

?[Frames](frames), ?[Hives](hives), ?[Actions](actions) and ?[Layouts](hive_layout) can all have static folders. 

## Defining a Static Folder

Static folders store all their resources in one or more subfolders. Typical subfolders include `js`, `css`, `img`, etc.; however you can name your static folders anything you like. 

Static folders are designated in the ?[configuration](config_files) of the host via a `static` JSON node. For instance, if you have an action "/foo", you might have the following definition in `foo_config.json`: 

``` json

{
  "routes": {
    "get": "/foo/foo"
  },
  "static": {
    "js": "/js/foo",
    "img": "/js/img"
  }
}

```

this would map the file `[site]/frames/foo_frame/hives/foo/static/img/foo_fighter.jpg` to the url `http://www.mysite.com/foo/img/foo_fighter.jpg`.

Note, this allows you to create the illusion of centralizing client side resources in virtual folders that may or may not exist. 

Again - you can define the "url prefix" of your static resources in any way you like. 

* * * 

note that while you CAN store static files in this fashion, you do not HAVE to. You can still store all your static files in a `public` folder, and/or you can store all the static files for a ?[frame](frames) in a single static folder.