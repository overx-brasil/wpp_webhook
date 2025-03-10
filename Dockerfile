FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     g++ \
     make \
     python3 \
  && rm -rf /var/lib/apt/lists/* \
  && npm install

COPY . .

RUN npm run build

EXPOSE 3004

CMD ["npm", "run", "start:prod"]