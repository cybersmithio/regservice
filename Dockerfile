FROM node

RUN mkdir -p /usr/src/app/configuration

COPY html /usr/src/app

COPY configuration /usr/src/app/configuration

RUN cd /usr/src/app; npm install

EXPOSE 443

WORKDIR /usr/src/app

CMD node regservice.js