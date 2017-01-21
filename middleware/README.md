Node Project Template - Middleware Folder
=================

Use this folder for [Express Middleware](http://expressjs.com/en/guide/using-middleware.html) functions.

*What's a _Middleware_?*

Middleware functions are functions that have access to the [request object](/en/4x/api.html#req) (`req`), the [response object](/en/4x/api.html#res) (`res`), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named `next`.

Middleware functions can perform the following tasks:

*   Execute any code.
*   Make changes to the request and the response objects.
*   End the request-response cycle.
*   Call the next middleware function in the stack.

If the current middleware function does not end the request-response cycle, it must call `next()` to pass control to the next middleware function. Otherwise, the request will be left hanging.

An Express application can use the following types of middleware:

*   [Application-level middleware](#middleware.application)
*   [Router-level middleware](#middleware.router)
*   [Error-handling middleware](#middleware.error-handling)
*   [Built-in middleware](#middleware.built-in)
*   [Third-party middleware](#middleware.third-party)
