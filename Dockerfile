FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY . /usr/share/nginx/html

EXPOSE 8080

CMD envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
    sed -i "s/__PORT__/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'
