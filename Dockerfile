FROM --platform=linux/amd64 node:16.18.0

ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

RUN cp /etc/apt/sources.list /etc/apt/sources.list~
RUN sed -Ei 's/^# deb-src /deb-src /' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install imagemagick

WORKDIR /usr/src/app
ENV NODE_ENV production
ENV PORT "3000"
ENV KEEP_ALIVE_TIMEOUT_MS "240000"
ENV USE_JSON_LOGGER "true"

COPY *.js /usr/src/app/
COPY *.json /usr/src/app/

RUN npm install

CMD [ "node", "index.js" ]
