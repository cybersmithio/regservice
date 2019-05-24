FROM node

COPY html /usr/src/app
COPY configuration /usr/src/app

RUN cd /usr/src/app; npm install

EXPOSE 443

WORKDIR /usr/src/app

CMD node regservice.js