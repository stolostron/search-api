# security-middleware
Security middleware for OCP oauth server
## Usage
### Production
No configuration is required to run it in production mode.
### Development
To run it locally, you will need to set following environment variables:
```bash
OAUTH2_CLIENT_ID #oauth client id
OAUTH2_CLIENT_SECRET #oauth client secret
OAUTH2_REDIRECT_URL #redirect url
API_SERVER_URL #kube api url
SERVICEACCT_TOKEN #kube token
```
For more information about openshift OAuth, see [here](https://docs.openshift.com/container-platform/4.2/authentication/configuring-internal-oauth.html#oauth-register-additional-client_configuring-internal-oauth)
### Use it
To protect `ui`
```javascript
const inspect = require('security-middleware')
router.all(['/', '/*'], inspect.ui(), app)
```
To protect `api`
```javascript
const inspect = require('security-middleware')
router.all(['/', '/*'], inspect.app, app)
```