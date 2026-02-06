FROM registry.cn-shenzhen.aliyuncs.com/sumply-shop/nginx
COPY unpackage/dist/build/web/ /usr/share/nginx/html/
