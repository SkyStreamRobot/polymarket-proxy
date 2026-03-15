# Polymarket CORS Proxy

Jednoduchý Node.js proxy pre Polymarket Gamma API. Určený pre nasadenie na Coolify / Docker.

## Endpointy

- `GET /api/markets?limit=35` — vráti live Polymarket trhy
- `GET /health` — health check

## Coolify deploy

1. Vytvor nové GitHub repo s týmito súbormi
2. V Coolify: New Resource → Public Repository → zadaj repo URL
3. Build Pack: **Dockerfile**
4. Port: **3000**
5. Deploy

## Lokálny test

```bash
docker build -t polymarket-proxy .
docker run -p 3000:3000 polymarket-proxy
curl http://localhost:3000/api/markets?limit=5
```
