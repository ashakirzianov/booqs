
# Local development over https (macOS)

Install ```brew``` if you haven't already. See [brew website](https://brew.sh).

```/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"```

Install ```mkcert```:

```brew install mkcert```

(Optional) Install ```certutil``` for Firefox support:

```brew install nss```

Create a new local Certificate Authority (CA):

```mkcert -install```

Create a certificate for the "localhost" domain. First, navigate to the repos *parent* directory. This is important because npm script configured to read key and cert from parent's dir. Then run mkcert:

```mkcert localhost```

Run local ssl proxy:

```npm run https```
