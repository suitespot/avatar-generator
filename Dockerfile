FROM node:10.16.3

RUN cp /etc/apt/sources.list /etc/apt/sources.list~
RUN sed -Ei 's/^# deb-src /deb-src /' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install imagemagick

WORKDIR /usr/src/app
ENV NODE_ENV production
ENV PORT 3000


COPY *.js /usr/src/app/
COPY *.json /usr/src/app/

RUN npm install

CMD [ "node", "index.js" ]
