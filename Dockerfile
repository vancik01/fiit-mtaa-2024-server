FROM node:16  
WORKDIR /app  
COPY package*.json ./  
RUN npm install --only=production  
COPY . .  
CMD [ "npm", "start" ]