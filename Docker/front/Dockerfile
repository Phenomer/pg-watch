FROM node:24 AS builder

COPY ./front /opt/db-watch
WORKDIR /opt/db-watch
RUN npm install
RUN npm run build

FROM caddy:latest AS runner
EXPOSE 80/tcp
COPY ./configs/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /opt/db-watch/dist /opt/db-watch
WORKDIR /opt/db-watch

CMD ["/usr/bin/caddy", "run", "-c", "/etc/caddy/Caddyfile"]
