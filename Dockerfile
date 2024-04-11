FROM node:lts
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]