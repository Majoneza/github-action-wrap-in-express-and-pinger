# github-action-wrap-in-express-and-pinger

This action wraps the specified program with express and pinger.

## Inputs

### `application-path`

**Required** Path from the root of the app repository. Default `"./"`.

### `default-port`

**Required** Port used when process.env.PORT is not defined. Default `8080`.

### `pinger-website`

**Required** Website to ping.

### `pinger-interval`

**Required** Interval between pings(in seconds). Default `60`.

## Example usage
```
uses: Majoneza/github-action-wrap-in-express@v1
with:
  default-port: 10000
  pinger-website: 'example.website'
```
