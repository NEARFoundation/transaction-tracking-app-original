#backend
FROM node:18

RUN mkdir -p /usr/src/backend/
RUN mkdir -p /usr/src/shared/

WORKDIR /usr/src/backend/
COPY ./backend/ /usr/src/backend/
COPY ../shared/ /usr/src/shared/

ENV PORT=8086
EXPOSE 8086

#RUN npm install
RUN yarn install

CMD ["yarn", "dev"]
#CMD ["npm", "start"]
