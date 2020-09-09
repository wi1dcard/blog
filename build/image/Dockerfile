# The base image is from https://github.com/kubernetes/ingress-nginx/tree/master/images/nginx

FROM quay.io/kubernetes-ingress-controller/nginx:0.106
COPY ./public /usr/local/nginx/html
EXPOSE 80/tcp
