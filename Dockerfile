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

ENV TWILIO_ACCOUNT_SID=AC77424eec8c6b9e3b55628bae90d0a235
ENV TWILIO_AUTH_TOKEN=f1b0771f8a0ff009064f62e6e2e91310
ENV TWILIO_WHATSAPP_NUMBER=+12292315694

EXPOSE 3004

CMD ["npm", "run", "start:prod"]