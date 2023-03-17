# temperature-app

This is a demo app that demonstrates a sensor connection to an insight service.

## Project setup

```
cp .env.example .env
yarn install
```

### Via Docker

This will load the entire application and make the web UI available at localhost:8080

```sh
docker-compose build
docker-compose up
```

## Backend local dev

```
yarn start
```

To view the Swagger UI interface:

```sh
open http://localhost:5000/docs
```

## Front end Local dev

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```
