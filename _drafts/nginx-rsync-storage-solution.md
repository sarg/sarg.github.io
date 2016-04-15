---
layout: post
title: Configuring http accessible file storage.
---

Our application is producing plenty of files everyday. The lifecycle of one cycle is as follows.
First we download it from external service, then we save it on a disk, then it is processed once, then it could be moved to archive.
In the archive files are stored indefinitily. 
I had looked for a distributed file storage solutions and found them over-complicated for my case.
I have chosen to implement simple solution based on nginx+rsync.

My current setup consists of 3 servers with 2x3TB disks. Each server has a RAID1 set up.

* appserver
* storage1
* storage2

Each server has special user `filestorage`. Application is instructed to save files to `/home/filestorage/app1/`\\
Files are then accessible at `http://localhost:8081/app1/`

nginx configuration on storage servers:

~~~ nginx
server {
  listen *:8081;

  root /home/filestorage;

  location /app1/ {
    alias /home/filestorage/app1/;
  }

  location /app2/ {
    alias /home/filestorage/app2/;
  }
}
~~~

nginx configuration on app server:

~~~ nginx
upstream storage {
  server     storage1:8081  fail_timeout=10s;
  server     storage2:8081  fail_timeout=10s;
}

server {
  listen *:8081;

  location @filestorage {
    proxy_pass          http://storage;
    proxy_next_upstream http_404;
  }

  location / {
    root      /home/filestorage/;
    try_files $uri @filestorage;
  }
}
~~~
