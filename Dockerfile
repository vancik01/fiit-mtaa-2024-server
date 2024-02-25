FROM node:16  
WORKDIR /
COPY package*.json ./  
COPY tsconfig.json ./  
RUN npm install --only=production  
COPY . .  

RUN npm run build

CMD [ "npm", "start" ]