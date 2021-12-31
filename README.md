## Description

Simple web proxy - allows opening websites without any additional VPN setup.

[Open Simple Web Proxy](https://swproxy.herokuapp.com/)

## How it works

The target URL is sent to the proxy server, after that proxy server requests the URL and sends the response back to the user.

## Advantages

Requests are anonymous, no PII data or user location is sent, no additional software/steps are required to set up the proxy.

## Technical details

Powered by [Nest](https://github.com/nestjs/nest).

Deployed to [Heroku](https://www.heroku.com/).

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pbazurin_simple-web-proxy&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=pbazurin_simple-web-proxy)

## License

[MIT](LICENSE)
