#backend
#FROM node:18
FROM 283114800351.dkr.ecr.us-east-1.amazonaws.com/nearfoundation/node:18

MAINTAINER na

RUN mkdir -p /usr/src/backend/
RUN mkdir -p /usr/src/shared/

WORKDIR /usr/src/backend/

ENV PORT=8086
EXPOSE 8086

COPY ./backend /usr/src/backend/
COPY ./shared /usr/src/shared/

WORKDIR /usr/src/backend/

#RUN npm install
RUN yarn install

WORKDIR /usr/src/shared/

#RUN npm install
RUN yarn install

WORKDIR /usr/src/backend/

#CMD ["yarn", "dev"]
CMD ["yarn", "start"]
#CMD ["npm", "start"]
