![frames900.png](/blog_image/frames700.png)

Hive-MVC has three tiers of organizations: [[actions]](Actions), Hives and Frames. 

1. **[[actions]](Actions)**, covered in detail elsewhere, respond to a subset of URLs. This can equate to a single URL, or a set of URLS that tie into a single REST endpoint. 
2. **Hives** are collections of Actions. Their purpose is to group actions, and to provide a set of common default configurations for Actions. They may also have their own set of [[resources]](Resources), but generally resources are better grouped at the Frame level.
3. **Frames** are collections of Hives that accomplish a single function, such as  providing a blog, or adding a support functionality such as flash messages or layout mixins. 

In classical MVC terminology, Hives fulfill the role of collections, and frames fulfill the role of modules.