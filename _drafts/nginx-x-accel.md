---
layout: post
title: Configuring X-Accel-Redirect in nginx.
---

I have to maintain a java web application. It is being run with Jetty server.
Nearly half of daily requests are to download image.

	$ wc -l /var/log/nginx/access.log
	260520 /var/log/nginx/access.log
	$ grep -c '/preview' /var/log/nginx/access.log
	144707

Because these requests should be authorized, they need to be processed by application.
For that situation nginx `X-Accel-Redirect` header could be used.

Instead of serving file from your application, you point the header to URL where files are served and nginx makes internal redirect to that URL.
That way you can remove burden of serving static files from your application.
