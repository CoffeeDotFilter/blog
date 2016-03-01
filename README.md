# CoffeeDotFilter Blog

This is our blog using full stack JavaScript!

### Why?

Because it's a great idea to revisit our first week project with all the knowledge we've learnt!

### We'll be building our blog with:

+ Hapi - our server technology
+ Redis - to store our data
+ Handlebars - as a templating engine
+ SASS - to compile our CSS

### Features

Our blog will have:

+ A Frontend view (homepage, blog page [and potentially about/contact page])
+ An admin/dashboard view to add and edit posts
+ A comments feature so users can leave comments on blog posts
+ A database to store all blog posts, comments and users/admins

#### Stretch Features

+ Image upload feature
+ TinyMCE or Summernote editor for blog posts

### Our initial data structures

Our most important data structure will be each blog post. A blog object with some of the data we would need could look something like this:

```js
// a redis hash (a collection of key value pairs)
{
  "author": "OwenTM",
  "picture": "https://coffeedotfilter-herokuapp.com/img/owentm.jpg",
  "date": Date.now(),
  "title": "My First Full Stack Blog Post",
  "body": "This is the body text for my blog post............",
  "comments": nameOfCommentsHash
}
```

The inital idea would be to store each post as a HASH in redis and keep a sorted set of all the hashnames ordered by date

```js
// redis sorted set, each with a score (number to sort by)
[
  "blogpost0001",
  "blogpost0002",
  "blogpost0003",
  "blogpost0004"
]
```
