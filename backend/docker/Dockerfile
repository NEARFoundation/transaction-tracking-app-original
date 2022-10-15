#backend
FROM node:18

MAINTAINER andyopstein@near.foundation

RUN mkdir -p /usr/src/backend/
RUN mkdir -p /usr/src/shared/

WORKDIR /usr/src/backend/

ENV PORT=8086
EXPOSE 8086

COPY ./backend/ /usr/src/backend/
COPY ../shared/ /usr/src/shared/

WORKDIR /usr/src/backend/

#RUN npm install
RUN yarn install

WORKDIR /usr/src/shared/

#RUN npm install
RUN yarn install

WORKDIR /usr/src/backend/

CMD ["yarn", "dev"]
#CMD ["npm", "start"]
