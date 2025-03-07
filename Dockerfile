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

RUN npx prisma generate

RUN npm run build

# Definição das variáveis de ambiente
ENV TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
ENV TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
ENV TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}

EXPOSE 3004

CMD ["npm", "run", "start:prod"]
