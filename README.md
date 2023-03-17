# temperature-app

This is a demo app that demonstrates a sensor connection to an insight service.

## Project setup

```
cp .env.example .env
yarn install
```

### Via Docker

```sh
docker build . -t temp-sensor
docker run --rm -it -p 8080:8080 temp-sensor
```

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
