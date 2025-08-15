FROM node:lts-alpine3.19
WORKDIR /app
COPY . .
RUN npm install \
&& npx tsc -b \
&& rm -rf node_modules \
&& rm -rf src \
&& npm install --production \
&& apk add ffmpeg
CMD [ "npm", "start" ]