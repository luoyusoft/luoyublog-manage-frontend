#!/bin/bash
/usr/local/nginx/sbin/nginx -s stop
sleep 2
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/nginx-luoyu.conf
