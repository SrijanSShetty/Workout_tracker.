# Workout_tracker.
# @mapbox/node-pre-gyp

#### @mapbox/node-pre-gyp makes it easy to publish and install Node.js C++ addons from binaries

[![Build Status](https://travis-ci.com/mapbox/node-pre-gyp.svg?branch=master)](https://travis-ci.com/mapbox/node-pre-gyp)
[![Build status](https://ci.appveyor.com/api/projects/status/3nxewb425y83c0gv)](https://ci.appveyor.com/project/Mapbox/node-pre-gyp)

`@mapbox/node-pre-gyp` stands between [npm](https://github.com/npm/npm) and [node-gyp](https://github.com/Tootallnate/node-gyp) and offers a cross-platform method of binary deployment.

### Special note on previous package

On Feb 9th, 2021 `@mapbox/node-pre-gyp@1.0.0` was [released](./CHANGELOG.md). Older, unscoped versions that are not part of the `@mapbox` org are deprecated and only `@mapbox/node-pre-gyp` will see updates going forward. To upgrade to the new package do:

```
npm uninstall node-pre-gyp --save
npm install @mapbox/node-pre-gyp --save
```

### Features

 - A command line tool called `node-pre-gyp` that can install your package's C++ module from a binary.
 - A variety of developer targeted commands for packaging, testing, and publishing binaries.
 - A JavaScript module that can dynamically require your installed binary: `require('@mapbox/node-pre-gyp').find`

For a hello world example of a module packaged with `node-pre-gyp` see <https://github.com/springmeyer/node-addon-example> and [the wiki ](https://github.com/mapbox/node-pre-gyp/wiki/Modules-using-node-pre-gyp) for real world examples.

## Credits

 - The module is modeled after [node-gyp](https://github.com/Tootallnate/node-gyp) by [@Tootallnate](https://github.com/Tootallnate)
 - Motivation for initial development came from [@ErisDS](https://github.com/ErisDS) and the [Ghost Project](https://github.com/TryGhost/Ghost).
 - Development is sponsored by [Mapbox](https://www.mapbox.com/)

## FAQ

See the [Frequently Ask Questions](https://github.com/mapbox/node-pre-gyp/wiki/FAQ).

## Depends

 - Node.js >= node v8.x

## Install

`node-pre-gyp` is designed to be installed as a local dependency of your Node.js C++ addon and accessed like:

    ./node_modules/.bin/node-pre-gyp --help

But you can also install it globally:

    npm install @mapbox/node-pre-gyp -g

## Usage

### Commands

View all possible commands:

    node-pre-gyp --help

- clean - Remove the entire folder containing the compiled .node module
- install - Install pre-built binary for module
- reinstall - Run "clean" and "install" at once
- build - Compile the module by dispatching to node-gyp or nw-gyp
- rebuild - Run "clean" and "build" at once
- package - Pack binary into tarball
- testpackage - Test that the staged package is valid
- publish - Publish pre-built binary
- unpublish - Unpublish pre-built binary
- info - Fetch info on published binaries

You can also chain commands:

    node-pre-gyp clean build unpublish publish info

### Options

Options include:

 - `-C/--directory`: run the command in this directory
 - `--build-from-source`: build from source instead of using pre-built binary
 - `--update-binary`: reinstall by replacing previously installed local binary with remote binary
 - `--runtime=node-webkit`: customize the runtime: `node`, `electron` and `node-webkit` are the valid options
 - `--fallback-to-build`: fallback to building from source if pre-built binary is not available
 - `--target=0.4.0`: Pass the target node or node-webkit version to compile against
 - `--target_arch=ia32`: Pass the target arch and override the host `arch`. Valid values are 'ia32','x64', or `arm`.
 - `--target_platform=win32`: Pass the target platform and override the host `platform`. Valid values are `linux`, `darwin`, `win32`, `sunos`, `freebsd`, `openbsd`, and `aix`.

Both `--build-from-source` and `--fallback-to-build` can be passed alone or they can provide values. You can pass `--fallback-to-build=false` to override the option as declared in package.json. In addition to being able to pass `--build-from-source` you can also pass `--build-from-source=myapp` where `myapp` is the name of your module.

For example: `npm install --build-from-source=myapp`. This is useful if:

 - `myapp` is referenced in the package.json of a larger app and therefore `myapp` is being installed as a dependency with `npm install`.
 - The larger app also depends on other modules installed with `node-pre-gyp`
 - You only want to trigger a source compile for `myapp` and the other modules.

### Configuring

This is a guide to configuring your module to use node-pre-gyp.

#### 1) Add new entries to your `package.json`

 - Add `@mapbox/node-pre-gyp` to `dependencies`
 - Add `aws-sdk` as a `devDependency`
 - Add a custom `install` script
 - Declare a `binary` object

This looks like:

```js
    "dependencies"  : {
      "@mapbox/node-pre-gyp": "1.x"
    },
    "devDependencies": {
      "aws-sdk": "2.x"
    }
    "scripts": {
        "install": "node-pre-gyp install --fallback-to-build"
    },
    "binary": {
        "module_name": "your_module",
        "module_path": "./lib/binding/",
        "host": "https://your_module.s3-us-west-1.amazonaws.com"
    }
```

For a full example see [node-addon-examples's package.json](https://github.com/springmeyer/node-addon-example/blob/master/package.json).

Let's break this down:

 - Dependencies need to list `node-pre-gyp`
 - Your devDependencies should list `aws-sdk` so that you can run `node-pre-gyp publish` locally or a CI system. We recommend using `devDependencies` only since `aws-sdk` is large and not needed for `node-pre-gyp install` since it only uses http to fetch binaries
 - Your `scripts` section should override the `install` target with `"install": "node-pre-gyp install --fallback-to-build"`. This allows node-pre-gyp to be used instead of the default npm behavior of always source compiling with `node-gyp` directly.
 - Your package.json should contain a `binary` section describing key properties you provide to allow node-pre-gyp to package optimally. They are detailed below.

Note: in the past we recommended putting `@mapbox/node-pre-gyp` in the `bundledDependencies`, but we no longer recommend this. In the past there were npm bugs (with node versions 0.10.x) that could lead to node-pre-gyp not being available at the right time during install (unless we bundled). This should no longer be the case. Also, for a time we recommended using `"preinstall": "npm install @mapbox/node-pre-gyp"` as an alternative method to avoid needing to bundle. But this did not behave predictably across all npm versions - see https://github.com/mapbox/node-pre-gyp/issues/260 for the details. So we do not recommend using `preinstall` to install `@mapbox/node-pre-gyp`. More history on this at https://github.com/strongloop/fsevents/issues/157#issuecomment-265545908.

##### The `binary` object has three required properties

###### module_name

The name of your native node module. This value must:

 - Match the name passed to [the NODE_MODULE macro](http://nodejs.org/api/addons.html#addons_hello_world)
 - Must be a valid C variable name (e.g. it cannot contain `-`)
 - Should not include the `.node` extension.

###### module_path

The location your native module is placed after a build. This should be an empty directory without other Javascript files. This entire directory will be packaged in the binary tarball. When installing from a remote package this directory will be overwritten with the contents of the tarball.

Note: This property supports variables based on [Versioning](#versioning).

###### host

A url to the remote location where you've published tarball binaries (must be `https` not `http`).

It is highly recommended that you use Amazon S3. The reasons are:

  - Various node-pre-gyp commands like `publish` and `info` only work with an S3 host.
  - S3 is a very solid hosting platform for distributing large files.
  - We provide detail documentation for using [S3 hosting](#s3-hosting) with node-pre-gyp.

Why then not require S3? Because while some applications using node-pre-gyp need to distribute binaries as large as 20-30 MB, others might have very small binaries and might wish to store them in a GitHub repo. This is not recommended, but if an author really wants to host in a non-S3 location then it should be possible.

It should also be mentioned that there is an optional and entirely separate npm module called [node-pre-gyp-github](https://github.com/bchr02/node-pre-gyp-github) which is intended to complement node-pre-gyp and be installed along with it. It provides the ability to store and publish your binaries within your repositories GitHub Releases if you would rather not use S3 directly. Installation and usage instructions can be found [here](https://github.com/bchr02/node-pre-gyp-github), but the basic premise is that instead of using the ```node-pre-gyp publish``` command you would use ```node-pre-gyp-github publish```.

##### The `binary` object other optional S3 properties

If you are not using a standard s3 path like `bucket_name.s3(.-)region.amazonaws.com`, you might get an error on `publish` because node-pre-gyp extracts the region and bucket from the `host` url. For example, you may have an on-premises s3-compatible storage  server, or may have configured a specific dns redirecting to an s3  endpoint. In these cases, you can explicitly set the `region` and `bucket` properties to tell node-pre-gyp to use these values instead of guessing from the `host` property. The following values can be used in the `binary` section:

###### host

The url to the remote server root location (must be `https` not `http`).

###### bucket

The bucket name where your tarball binaries should be located.

###### region

Your S3 server region.

###### s3ForcePathStyle

Set `s3ForcePathStyle` to true if the endpoint url should not be prefixed with the bucket name. If false (default), the server endpoint would be  constructed as `bucket_name.your_server.com`.

##### The `binary` object has optional properties

###### remote_path

It **is recommended** that you customize this property. This is an extra path to use for publishing and finding remote tarballs. The default value for `remote_path` is `""` meaning that if you do not provide it then all packages will be published at the base of the `host`. It is recommended to provide a value like `./{name}/v{version}` to help organize remote packages in the case that you choose to publish multiple node addons to the same `host`.

Note: This property supports variables based on [Versioning](#versioning).

###### package_name

It is **not recommended** to override this property unless you are also overriding the `remote_path`. This is the versioned name of the remote tarball containing the binary `.node` module and any supporting files you've placed inside the `module_path` directory. Unless you specify `package_name` in your `package.json` then it defaults to `{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz` which allows your binary to work across node versions, platforms, and architectures. If you are using `remote_path` that is also versioned by `./{module_name}/v{version}` then you could remove these variables from the `package_name` and just use: `{node_abi}-{platform}-{arch}.tar.gz`. Then your remote tarball will be looked up at, for example, `https://example.com/your-module/v0.1.0/node-v11-linux-x64.tar.gz`.

Avoiding the version of your module in the `package_name` and instead only embedding in a directory name can be useful when you want to make a quick tag of your module that does not change any C++ code. In this case you can just copy binaries to the new version behind the scenes like:

```sh
aws s3 sync --acl public-read s3://mapbox-node-binary/sqlite3/v3.0.3/ s3://mapbox-node-binary/sqlite3/v3.0.4/
```

Note: This property supports variables based on [Versioning](#versioning).

#### 2) Add a new target to binding.gyp

`node-pre-gyp` calls out to `node-gyp` to compile the module and passes variables along like [module_name](#module_name) and [module_path](#module_path).

A new target must be added to `binding.gyp` that moves the compiled `.node` module from `./build/Release/module_name.node` into the directory specified by `module_path`.

Add a target like this at the end of your `targets` list:

```js
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
```

For a full example see [node-addon-example's binding.gyp](https://github.com/springmeyer/node-addon-example/blob/2ff60a8ded7f042864ad21db00c3a5a06cf47075/binding.gyp).

#### 3) Dynamically require your `.node`

Inside the main js file that requires your addon module you are likely currently doing:

```js
var binding = require('../build/Release/binding.node');
```

or:

```js
var bindings = require('./bindings')
```

Change those lines to:

```js
var binary = require('@mapbox/node-pre-gyp');
var path = require('path');
var binding_path = binary.find(path.resolve(path.join(__dirname,'./package.json')));
var binding = require(binding_path);
```

For a full example see [node-addon-example's index.js](https://github.com/springmeyer/node-addon-example/blob/2ff60a8ded7f042864ad21db00c3a5a06cf47075/index.js#L1-L4)

#### 4) Build and package your app

Now build your module from source:

    npm install --build-from-source

The `--build-from-source` tells `node-pre-gyp` to not look for a remote package and instead dispatch to node-gyp to build.

Now `node-pre-gyp` should now also be installed as a local dependency so the command line tool it offers can be found at `./node_modules/.bin/node-pre-gyp`.

#### 5) Test

Now `npm test` should work just as it did before.

#### 6) Publish the tarball

Then package your app:

    ./node_modules/.bin/node-pre-gyp package

Once packaged, now you can publish:

    ./node_modules/.bin/node-pre-gyp publish

Currently the `publish` command pushes your binary to S3. This requires:

 - You have installed `aws-sdk` with `npm install aws-sdk`
 - You have created a bucket already.
 - The `host` points to an S3 http or https endpoint.
 - You have configured node-pre-gyp to read your S3 credentials (see [S3 hosting](#s3-hosting) for details).

You can also host your binaries elsewhere. To do this requires:

 - You manually publish the binary created by the `package` command to an `https` endpoint
 - Ensure that the `host` value points to your custom `https` endpoint.

#### 7) Automate builds

Now you need to publish builds for all the platforms and node versions you wish to support. This is best automated.

 - See [Appveyor Automation](#appveyor-automation) for how to auto-publish builds on Windows.
 - See [Travis Automation](#travis-automation) for how to auto-publish builds on OS X and Linux.

#### 8) You're done!

Now publish your module to the npm registry. Users will now be able to install your module from a binary.

What will happen is this:

1. `npm install <your package>` will pull from the npm registry
2. npm will run the `install` script which will call out to `node-pre-gyp`
3. `node-pre-gyp` will fetch the binary `.node` module and unpack in the right place
4. Assuming that all worked, you are done

If a a binary was not available for a given platform and `--fallback-to-build` was used then `node-gyp rebuild` will be called to try to source compile the module.

#### 9) One more option

It may be that you want to work with two s3 buckets, one for staging and one for production; this
arrangement makes it less likely to accidentally overwrite a production binary. It also allows the production
environment to have more restrictive permissions than staging while still enabling publishing when
developing and testing.

The binary.host property can be set at execution time. In order to do so all of the following conditions
must be true.

- binary.host is falsey or not present
- binary.staging_host is not empty
- binary.production_host is not empty

If any of these checks fail then the operation will not perform execution time determination of the s3 target.

If the command being executed is either "publish" or "unpublish" then the default is set to `binary.staging_host`. In all other cases
the default is `binary.production_host`.

The command-line options `--s3_host=staging` or `--s3_host=production` override the default. If `s3_host`
is present and not `staging` or `production` an exception is thrown.

This allows installing from staging by specifying `--s3_host=staging`. And it requires specifying
`--s3_option=production` in order to publish to, or unpublish from, production, making accidental errors less likely.

## Node-API Considerations

[Node-API](https://nodejs.org/api/n-api.html#n_api_node_api), which was previously known as N-API, is an ABI-stable alternative to previous technologies such as [nan](https://github.com/nodejs/nan) which are tied to a specific Node runtime engine. Node-API is Node runtime engine agnostic and guarantees modules created today will continue to run, without changes, into the future.

Using `node-pre-gyp` with Node-API projects requires a handful of additional configuration values and imposes some additional requirements.

The most significant difference is that an Node-API module can be coded to target multiple  Node-API versions. Therefore, an Node-API module must declare in its `package.json` file which Node-API versions the module is designed to run against. In addition, since multiple builds may be required for a single module, path and file names must be specified in way that avoids naming conflicts.

### The `napi_versions` array property

A Node-API module must declare in its `package.json` file, the Node-API versions the module is intended to support. This is accomplished by including an `napi-versions` array property in the `binary` object. For example:

```js
"binary": {
    "module_name": "your_module",
    "module_path": "your_module_path",
    "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
    "napi_versions": [1,3]
  }
```

If the `napi_versions` array property is *not* present, `node-pre-gyp` operates as it always has. Including the `napi_versions` array property instructs `node-pre-gyp` that this is a Node-API module build.

When the `napi_versions` array property is present, `node-pre-gyp` fires off multiple operations, one for each of the Node-API versions in the array. In the example above, two operations are initiated, one for Node-API version 1 and second for Node-API version 3. How this version number is communicated is described next.

### The `napi_build_version` value

For each of the Node-API module operations `node-pre-gyp` initiates, it ensures that the `napi_build_version` is set appropriately.

This value is of importance in two areas:

1. The C/C++ code which needs to know against which Node-API version it should compile.
2. `node-pre-gyp` itself which must assign appropriate path and file names to avoid collisions.

### Defining `NAPI_VERSION` for the C/C++ code

The `napi_build_version` value is communicated to the C/C++ code by adding this code to the `binding.gyp` file:

```
"defines": [
    "NAPI_VERSION=<(napi_build_version)",
]
```

This ensures that `NAPI_VERSION`, an integer value, is declared appropriately to the C/C++ code for each build.

> Note that earlier versions of this document recommended defining the symbol `NAPI_BUILD_VERSION`. `NAPI_VERSION` is preferred because it used by the Node-API C/C++ headers to configure the specific Node-API versions being requested.

### Path and file naming requirements in `package.json`

Since `node-pre-gyp` fires off multiple operations for each request, it is essential that path and file names be created in such a way as to avoid collisions. This is accomplished by imposing additional path and file naming requirements.

Specifically, when performing Node-API builds, the `{napi_build_version}` text configuration value  *must* be present in the `module_path` property. In addition, the `{napi_build_version}` text configuration value  *must* be present in either the `remote_path` or `package_name` property. (No problem if it's in both.)

Here's an example:

```js
"binary": {
    "module_name": "your_module",
    "module_path": "./lib/binding/napi-v{napi_build_version}",
    "remote_path": "./{module_name}/v{version}/{configuration}/",
    "package_name": "{platform}-{arch}-napi-v{napi_build_version}.tar.gz",
    "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
    "napi_versions": [1,3]
  }
```

## Supporting both Node-API and NAN builds

You may have a legacy native add-on that you wish to continue supporting for those versions of Node that do not support Node-API, as you add Node-API support for later Node versions. This can be accomplished by specifying the `node_napi_label` configuration value in the package.json `binary.package_name` property.

Placing the configuration value `node_napi_label` in the package.json `binary.package_name` property instructs `node-pre-gyp` to build all viable Node-API binaries supported by the current Node instance. If the current Node instance does not support Node-API, `node-pre-gyp` will request a traditional, non-Node-API build.

The configuration value `node_napi_label` is set by `node-pre-gyp` to the type of build created, `napi` or `node`, and the version number. For Node-API builds, the string contains the Node-API version nad has values like `napi-v3`. For traditional, non-Node-API builds, the string contains the ABI version with values like `node-v46`.

Here's how the `binary` configuration above might be changed to support both Node-API and NAN builds:

```js
"binary": {
    "module_name": "your_module",
    "module_path": "./lib/binding/{node_napi_label}",
    "remote_path": "./{module_name}/v{version}/{configuration}/",
    "package_name": "{platform}-{arch}-{node_napi_label}.tar.gz",
    "host": "https://your_bucket.s3-us-west-1.amazonaws.com",
    "napi_versions": [1,3]
  }
```

The C/C++ symbol `NAPI_VERSION` can be used to distinguish Node-API and non-Node-API builds. The value of `NAPI_VERSION` is set to the integer Node-API version for Node-API builds and is set to `0` for non-Node-API builds.

For example:

```C
#if NAPI_VERSION
// Node-API code goes here
#else
// NAN code goes here
#endif
```

### Two additional configuration values

The following two configuration values, which were implemented in previous versions of `node-pre-gyp`, continue to exist, but have been replaced by the `node_napi_label` configuration value described above.

1. `napi_version` If Node-API is supported by the currently executing Node instance, this value is the Node-API version number supported by Node. If Node-API is not supported, this value is an empty string.

2. `node_abi_napi` If the value returned for `napi_version` is non empty, this value is `'napi'`. If the value returned for `napi_version` is empty, this value is the value returned for `node_abi`.

These values are present for use in the `binding.gyp` file and may be used as `{napi_version}` and `{node_abi_napi}` for text substituion in the `binary` properties of the `package.json` file.

## S3 Hosting

You can host wherever you choose but S3 is cheap, `node-pre-gyp publish` expects it, and S3 can be integrated well with [Travis.ci](http://travis-ci.org) to automate builds for OS X and Ubuntu, and with [Appveyor](http://appveyor.com) to automate builds for Windows. Here is an approach to do this:

First, get setup locally and test the workflow:

#### 1) Create an S3 bucket

And have your **key** and **secret key** ready for writing to the bucket.

It is recommended to create a IAM user with a policy that only gives permissions to the specific bucket you plan to publish to. This can be done in the [IAM console](https://console.aws.amazon.com/iam/) by: 1) adding a new user, 2) choosing `Attach User Policy`, 3) Using the `Policy Generator`, 4) selecting `Amazon S3` for the service, 5) adding the actions: `DeleteObject`, `GetObject`, `GetObjectAcl`, `ListBucket`, `HeadBucket`, `PutObject`, `PutObjectAcl`, 6) adding an ARN of `arn:aws:s3:::bucket/*` (replacing `bucket` with your bucket name), and finally 7) clicking `Add Statement` and saving the policy. It should generate a policy like:

```js
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "objects",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Sid": "bucket",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::your-bucket-name"
        },
        {
            "Sid": "buckets",
            "Effect": "Allow",
            "Action": "s3:HeadBucket",
            "Resource": "*"
        }
    ]
}
```

#### 2) Install node-pre-gyp

Either install it globally:

    npm install node-pre-gyp -g

Or put the local version on your PATH

    export PATH=`pwd`/node_modules/.bin/:$PATH

#### 3) Configure AWS credentials

It is recommended to configure the AWS JS SDK v2 used internally by `node-pre-gyp` by setting these environment variables:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

But also you can also use the `Shared Config File` mentioned [in the AWS JS SDK v2 docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html)

#### 4) Package and publish your build

Install the `aws-sdk`:

    npm install aws-sdk

Then publish:

    node-pre-gyp package publish

Note: if you hit an error like `Hostname/IP doesn't match certificate's altnames` it may mean that you need to provide the `region` option in your config.

## Appveyor Automation

[Appveyor](http://www.appveyor.com/) can build binaries and publish the results per commit and supports:

 - Windows Visual Studio 2013 and related compilers
 - Both 64 bit (x64) and 32 bit (x86) build configurations
 - Multiple Node.js versions

For an example of doing this see [node-sqlite3's appveyor.yml](https://github.com/mapbox/node-sqlite3/blob/master/appveyor.yml).

Below is a guide to getting set up:

#### 1) Create a free Appveyor account

Go to https://ci.appveyor.com/signup/free and sign in with your GitHub account.

#### 2) Create a new project

Go to https://ci.appveyor.com/projects/new and select the GitHub repo for your module

#### 3) Add appveyor.yml and push it

Once you have committed an `appveyor.yml` ([appveyor.yml reference](http://www.appveyor.com/docs/appveyor-yml)) to your GitHub repo and pushed it AppVeyor should automatically start building your project.

#### 4) Create secure variables

Encrypt your S3 AWS keys by going to <https://ci.appveyor.com/tools/encrypt> and hitting the `encrypt` button.

Then paste the result into your `appveyor.yml`

```yml
environment:
  AWS_ACCESS_KEY_ID:
    secure: Dn9HKdLNYvDgPdQOzRq/DqZ/MPhjknRHB1o+/lVU8MA=
  AWS_SECRET_ACCESS_KEY:
    secure: W1rwNoSnOku1r+28gnoufO8UA8iWADmL1LiiwH9IOkIVhDTNGdGPJqAlLjNqwLnL
```

NOTE: keys are per account but not per repo (this is difference than Travis where keys are per repo but not related to the account used to encrypt them).

#### 5) Hook up publishing

Just put `node-pre-gyp package publish` in your `appveyor.yml` after `npm install`.

#### 6) Publish when you want

You might wish to publish binaries only on a specific commit. To do this you could borrow from the [Travis CI idea of commit keywords](http://about.travis-ci.org/docs/user/how-to-skip-a-build/) and add special handling for commit messages with `[publish binary]`:

    SET CM=%APPVEYOR_REPO_COMMIT_MESSAGE%
    if not "%CM%" == "%CM:[publish binary]=%" node-pre-gyp --msvs_version=2013 publish

If your commit message contains special characters (e.g. `&`) this method might fail. An alternative is to use PowerShell, which gives you additional possibilities, like ignoring case by using `ToLower()`:

    ps: if($env:APPVEYOR_REPO_COMMIT_MESSAGE.ToLower().Contains('[publish binary]')) { node-pre-gyp --msvs_version=2013 publish }

Remember this publishing is not the same as `npm publish`. We're just talking about the binary module here and not your entire npm package.

## Travis Automation

[Travis](https://travis-ci.org/) can push to S3 after a successful build and supports both:

 - Ubuntu Precise and OS X (64 bit)
 - Multiple Node.js versions

For an example of doing this see [node-add-example's .travis.yml](https://github.com/springmeyer/node-addon-example/blob/2ff60a8ded7f042864ad21db00c3a5a06cf47075/.travis.yml).

Note: if you need 32 bit binaries, this can be done from a 64 bit Travis machine. See [the node-sqlite3 scripts for an example of doing this](https://github.com/mapbox/node-sqlite3/blob/bae122aa6a2b8a45f6b717fab24e207740e32b5d/scripts/build_against_node.sh#L54-L74).

Below is a guide to getting set up:

#### 1) Install the Travis gem

    gem install travis

#### 2) Create secure variables

Make sure you run this command from within the directory of your module.

Use `travis-encrypt` like:

    travis encrypt AWS_ACCESS_KEY_ID=${node_pre_gyp_accessKeyId}
    travis encrypt AWS_SECRET_ACCESS_KEY=${node_pre_gyp_secretAccessKey}

Then put those values in your `.travis.yml` like:

```yaml
env:
  global:
    - secure: F+sEL/v56CzHqmCSSES4pEyC9NeQlkoR0Gs/ZuZxX1ytrj8SKtp3MKqBj7zhIclSdXBz4Ev966Da5ctmcTd410p0b240MV6BVOkLUtkjZJyErMBOkeb8n8yVfSoeMx8RiIhBmIvEn+rlQq+bSFis61/JkE9rxsjkGRZi14hHr4M=
    - secure: o2nkUQIiABD139XS6L8pxq3XO5gch27hvm/gOdV+dzNKc/s2KomVPWcOyXNxtJGhtecAkABzaW8KHDDi5QL1kNEFx6BxFVMLO8rjFPsMVaBG9Ks6JiDQkkmrGNcnVdxI/6EKTLHTH5WLsz8+J7caDBzvKbEfTux5EamEhxIWgrI=
```

More details on Travis encryption at http://about.travis-ci.org/docs/user/encryption-keys/.

#### 3) Hook up publishing

Just put `node-pre-gyp package publish` in your `.travis.yml` after `npm install`.

##### OS X publishing

If you want binaries for OS X in addition to linux you can enable [multi-os for Travis](http://docs.travis-ci.com/user/multi-os/#Setting-.travis.yml)

Use a configuration like:

```yml

language: cpp

os:
- linux
- osx

env:
  matrix:
    - NODE_VERSION="4"
    - NODE_VERSION="6"

before_install:
- rm -rf ~/.nvm/ && git clone --depth 1 https://github.com/creationix/nvm.git ~/.nvm
- source ~/.nvm/nvm.sh
- nvm install $NODE_VERSION
- nvm use $NODE_VERSION
```

See [Travis OS X Gotchas](#travis-os-x-gotchas) for why we replace `language: node_js` and `node_js:` sections with `language: cpp` and a custom matrix.

Also create platform specific sections for any deps that need install. For example if you need libpng:

```yml
- if [ $(uname -s) == 'Linux' ]; then apt-get install libpng-dev; fi;
- if [ $(uname -s) == 'Darwin' ]; then brew install libpng; fi;
```

For detailed multi-OS examples see [node-mapnik](https://github.com/mapnik/node-mapnik/blob/master/.travis.yml) and [node-sqlite3](https://github.com/mapbox/node-sqlite3/blob/master/.travis.yml).

##### Travis OS X Gotchas

First, unlike the Travis Linux machines, the OS X machines do not put `node-pre-gyp` on PATH by default. To do so you will need to:

```sh
export PATH=$(pwd)/node_modules/.bin:${PATH}
```

Second, the OS X machines do not support using a matrix for installing different Node.js versions. So you need to bootstrap the installation of Node.js in a cross platform way.

By doing:

```yml
env:
  matrix:
    - NODE_VERSION="4"
    - NODE_VERSION="6"

before_install:
 - rm -rf ~/.nvm/ && git clone --depth 1 https://github.com/creationix/nvm.git ~/.nvm
 - source ~/.nvm/nvm.sh
 - nvm install $NODE_VERSION
 - nvm use $NODE_VERSION
```

You can easily recreate the previous behavior of this matrix:

```yml
node_js:
  - "4"
  - "6"
```

#### 4) Publish when you want

You might wish to publish binaries only on a specific commit. To do this you could borrow from the [Travis CI idea of commit keywords](http://about.travis-ci.org/docs/user/how-to-skip-a-build/) and add special handling for commit messages with `[publish binary]`:

    COMMIT_MESSAGE=$(git log --format=%B --no-merges -n 1 | tr -d '\n')
    if [[ ${COMMIT_MESSAGE} =~ "[publish binary]" ]]; then node-pre-gyp publish; fi;

Then you can trigger new binaries to be built like:

    git commit -a -m "[publish binary]"

Or, if you don't have any changes to make simply run:

    git commit --allow-empty -m "[publish binary]"

WARNING: if you are working in a pull request and publishing binaries from there then you will want to avoid double publishing when Travis CI builds both the `push` and `pr`. You only want to run the publish on the `push` commit. See https://github.com/Project-OSRM/node-osrm/blob/8eb837abe2e2e30e595093d16e5354bc5c573575/scripts/is_pr_merge.sh which is called from https://github.com/Project-OSRM/node-osrm/blob/8eb837abe2e2e30e595093d16e5354bc5c573575/scripts/publish.sh for an example of how to do this.

Remember this publishing is not the same as `npm publish`. We're just talking about the binary module here and not your entire npm package. To automate the publishing of your entire package to npm on Travis see http://about.travis-ci.org/docs/user/deployment/npm/

# Versioning

The `binary` properties of `module_path`, `remote_path`, and `package_name` support variable substitution. The strings are evaluated by `node-pre-gyp` depending on your system and any custom build flags you passed.

 - `node_abi`: The node C++ `ABI` number. This value is available in Javascript as `process.versions.modules` as of [`>= v0.10.4 >= v0.11.7`](https://github.com/joyent/node/commit/ccabd4a6fa8a6eb79d29bc3bbe9fe2b6531c2d8e) and in C++ as the `NODE_MODULE_VERSION` define much earlier. For versions of Node before this was available we fallback to the V8 major and minor version.
 - `platform` matches node's `process.platform` like `linux`, `darwin`, and `win32` unless the user passed the `--target_platform` option to override.
 - `arch` matches node's `process.arch` like `x64` or `ia32` unless the user passes the `--target_arch` option to override.
 - `libc` matches `require('detect-libc').family` like `glibc` or `musl` unless the user passes the `--target_libc` option to override.
 - `configuration` - Either 'Release' or 'Debug' depending on if `--debug` is passed during the build.
 - `module_name` - the `binary.module_name` attribute from `package.json`.
 - `version` - the semver `version` value for your module from `package.json` (NOTE: ignores the `semver.build` property).
 - `major`, `minor`, `patch`, and `prelease` match the individual semver values for your module's `version`
 - `build` - the sevmer `build` value. For example it would be `this.that` if your package.json `version` was `v1.0.0+this.that`
 - `prerelease` - the semver `prerelease` value. For example it would be `alpha.beta` if your package.json `version` was `v1.0.0-alpha.beta`


The options are visible in the code at <https://github.com/mapbox/node-pre-gyp/blob/612b7bca2604508d881e1187614870ba19a7f0c5/lib/util/versioning.js#L114-L127>

# Download binary files from a mirror

S3 is broken in China for the well known reason.

Using the `npm` config argument: `--{module_name}_binary_host_mirror` can download binary files through a mirror, `-` in `module_name` will be replaced with `_`.

e.g.: Install [v8-profiler](https://www.npmjs.com/package/v8-profiler) from `npm`.

```bash
$ npm install v8-profiler --profiler_binary_host_mirror=https://npm.taobao.org/mirrors/node-inspector/
```

e.g.: Install [canvas-prebuilt](https://www.npmjs.com/package/canvas-prebuilt) from `npm`.

```bash
$ npm install canvas-prebuilt --canvas_prebuilt_binary_host_mirror=https://npm.taobao.org/mirrors/canvas-prebuilt/
```
# Installation
> `npm install --save @types/webidl-conversions`

# Summary
This package contains type definitions for webidl-conversions (https://github.com/jsdom/webidl-conversions#readme).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/webidl-conversions.

### Additional Details
 * Last updated: Fri, 02 Jul 2021 18:05:21 GMT
 * Dependencies: none
 * Global values: none

# Credits
These definitions were written by [ExE Boss](https://github.com/ExE-Boss).
# Installation
> `npm install --save @types/whatwg-url`

# Summary
This package contains type definitions for whatwg-url (https://github.com/jsdom/whatwg-url#readme).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/whatwg-url.

### Additional Details
 * Last updated: Fri, 02 Jul 2021 18:05:37 GMT
 * Dependencies: [@types/webidl-conversions](https://npmjs.com/package/@types/webidl-conversions), [@types/node](https://npmjs.com/package/@types/node)
 * Global values: none

# Credits
These definitions were written by [Alexander Marks](https://github.com/aomarks), and [ExE Boss](https://github.com/ExE-Boss).
# abbrev-js

Just like [ruby's Abbrev](http://apidock.com/ruby/Abbrev).

Usage:

    var abbrev = require("abbrev");
    abbrev("foo", "fool", "folding", "flop");
    
    // returns:
    { fl: 'flop'
    , flo: 'flop'
    , flop: 'flop'
    , fol: 'folding'
    , fold: 'folding'
    , foldi: 'folding'
    , foldin: 'folding'
    , folding: 'folding'
    , foo: 'foo'
    , fool: 'fool'
    }

This is handy for command-line scripts, or other cases where you want to be able to accept shorthands.
# accepts

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Higher level content negotiation based on [negotiator](https://www.npmjs.com/package/negotiator).
Extracted from [koa](https://www.npmjs.com/package/koa) for general use.

In addition to negotiator, it allows:

- Allows types as an array or arguments list, ie `(['text/html', 'application/json'])`
  as well as `('text/html', 'application/json')`.
- Allows type shorthands such as `json`.
- Returns `false` when no types match
- Treats non-existent headers as `*`

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install accepts
```

## API

```js
var accepts = require('accepts')
```

### accepts(req)

Create a new `Accepts` object for the given `req`.

#### .charset(charsets)

Return the first accepted charset. If nothing in `charsets` is accepted,
then `false` is returned.

#### .charsets()

Return the charsets that the request accepts, in the order of the client's
preference (most preferred first).

#### .encoding(encodings)

Return the first accepted encoding. If nothing in `encodings` is accepted,
then `false` is returned.

#### .encodings()

Return the encodings that the request accepts, in the order of the client's
preference (most preferred first).

#### .language(languages)

Return the first accepted language. If nothing in `languages` is accepted,
then `false` is returned.

#### .languages()

Return the languages that the request accepts, in the order of the client's
preference (most preferred first).

#### .type(types)

Return the first accepted type (and it is returned as the same text as what
appears in the `types` array). If nothing in `types` is accepted, then `false`
is returned.

The `types` array can contain full MIME types or file extensions. Any value
that is not a full MIME types is passed to `require('mime-types').lookup`.

#### .types()

Return the types that the request accepts, in the order of the client's
preference (most preferred first).

## Examples

### Simple type negotiation

This simple example shows how to use `accepts` to return a different typed
respond body based on what the client wants to accept. The server lists it's
preferences in order and will get back the best match between the client and
server.

```js
var accepts = require('accepts')
var http = require('http')

function app (req, res) {
  var accept = accepts(req)

  // the order of this list is significant; should be server preferred order
  switch (accept.type(['json', 'html'])) {
    case 'json':
      res.setHeader('Content-Type', 'application/json')
      res.write('{"hello":"world!"}')
      break
    case 'html':
      res.setHeader('Content-Type', 'text/html')
      res.write('<b>hello, world!</b>')
      break
    default:
      // the fallback is text/plain, so no need to specify it above
      res.setHeader('Content-Type', 'text/plain')
      res.write('hello, world!')
      break
  }

  res.end()
}

http.createServer(app).listen(3000)
```

You can test this out with the cURL program:
```sh
curl -I -H'Accept: text/html' http://localhost:3000/
```

## License

[MIT](LICENSE)

[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/accepts/master
[coveralls-url]: https://coveralls.io/r/jshttp/accepts?branch=master
[github-actions-ci-image]: https://badgen.net/github/checks/jshttp/accepts/master?label=ci
[github-actions-ci-url]: https://github.com/jshttp/accepts/actions/workflows/ci.yml
[node-version-image]: https://badgen.net/npm/node/accepts
[node-version-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/accepts
[npm-url]: https://npmjs.org/package/accepts
[npm-version-image]: https://badgen.net/npm/v/accepts
agent-base
==========
### Turn a function into an [`http.Agent`][http.Agent] instance
[![Build Status](https://github.com/TooTallNate/node-agent-base/workflows/Node%20CI/badge.svg)](https://github.com/TooTallNate/node-agent-base/actions?workflow=Node+CI)

This module provides an `http.Agent` generator. That is, you pass it an async
callback function, and it returns a new `http.Agent` instance that will invoke the
given callback function when sending outbound HTTP requests.

#### Some subclasses:

Here's some more interesting uses of `agent-base`.
Send a pull request to list yours!

 * [`http-proxy-agent`][http-proxy-agent]: An HTTP(s) proxy `http.Agent` implementation for HTTP endpoints
 * [`https-proxy-agent`][https-proxy-agent]: An HTTP(s) proxy `http.Agent` implementation for HTTPS endpoints
 * [`pac-proxy-agent`][pac-proxy-agent]: A PAC file proxy `http.Agent` implementation for HTTP and HTTPS
 * [`socks-proxy-agent`][socks-proxy-agent]: A SOCKS proxy `http.Agent` implementation for HTTP and HTTPS


Installation
------------

Install with `npm`:

``` bash
$ npm install agent-base
```


Example
-------

Here's a minimal example that creates a new `net.Socket` connection to the server
for every HTTP request (i.e. the equivalent of `agent: false` option):

```js
var net = require('net');
var tls = require('tls');
var url = require('url');
var http = require('http');
var agent = require('agent-base');

var endpoint = 'http://nodejs.org/api/';
var parsed = url.parse(endpoint);

// This is the important part!
parsed.agent = agent(function (req, opts) {
  var socket;
  // `secureEndpoint` is true when using the https module
  if (opts.secureEndpoint) {
    socket = tls.connect(opts);
  } else {
    socket = net.connect(opts);
  }
  return socket;
});

// Everything else works just like normal...
http.get(parsed, function (res) {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
```

Returning a Promise or using an `async` function is also supported:

```js
agent(async function (req, opts) {
  await sleep(1000);
  // etc…
});
```

Return another `http.Agent` instance to "pass through" the responsibility
for that HTTP request to that agent:

```js
agent(function (req, opts) {
  return opts.secureEndpoint ? https.globalAgent : http.globalAgent;
});
```


API
---

## Agent(Function callback[, Object options]) → [http.Agent][]

Creates a base `http.Agent` that will execute the callback function `callback`
for every HTTP request that it is used as the `agent` for. The callback function
is responsible for creating a `stream.Duplex` instance of some kind that will be
used as the underlying socket in the HTTP request.

The `options` object accepts the following properties:

  * `timeout` - Number - Timeout for the `callback()` function in milliseconds. Defaults to Infinity (optional).

The callback function should have the following signature:

### callback(http.ClientRequest req, Object options, Function cb) → undefined

The ClientRequest `req` can be accessed to read request headers and
and the path, etc. The `options` object contains the options passed
to the `http.request()`/`https.request()` function call, and is formatted
to be directly passed to `net.connect()`/`tls.connect()`, or however
else you want a Socket to be created. Pass the created socket to
the callback function `cb` once created, and the HTTP request will
continue to proceed.

If the `https` module is used to invoke the HTTP request, then the
`secureEndpoint` property on `options` _will be set to `true`_.


License
-------

(The MIT License)

Copyright (c) 2013 Nathan Rajlich &lt;nathan@tootallnate.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[http-proxy-agent]: https://github.com/TooTallNate/node-http-proxy-agent
[https-proxy-agent]: https://github.com/TooTallNate/node-https-proxy-agent
[pac-proxy-agent]: https://github.com/TooTallNate/node-pac-proxy-agent
[socks-proxy-agent]: https://github.com/TooTallNate/node-socks-proxy-agent
[http.Agent]: https://nodejs.org/api/http.html#http_class_http_agent
# ansi-regex

> Regular expression for matching [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code)


## Install

```
$ npm install ansi-regex
```


## Usage

```js
const ansiRegex = require('ansi-regex');

ansiRegex().test('\u001B[4mcake\u001B[0m');
//=> true

ansiRegex().test('cake');
//=> false

'\u001B[4mcake\u001B[0m'.match(ansiRegex());
//=> ['\u001B[4m', '\u001B[0m']

'\u001B[4mcake\u001B[0m'.match(ansiRegex({onlyFirst: true}));
//=> ['\u001B[4m']

'\u001B]8;;https://github.com\u0007click\u001B]8;;\u0007'.match(ansiRegex());
//=> ['\u001B]8;;https://github.com\u0007', '\u001B]8;;\u0007']
```


## API

### ansiRegex(options?)

Returns a regex for matching ANSI escape codes.

#### options

Type: `object`

##### onlyFirst

Type: `boolean`<br>
Default: `false` *(Matches any ANSI escape codes in a string)*

Match only the first ANSI escape.


## FAQ

### Why do you test for codes not in the ECMA 48 standard?

Some of the codes we run as a test are codes that we acquired finding various lists of non-standard or manufacturer specific codes. We test for both standard and non-standard codes, as most of them follow the same or similar format and can be safely matched in strings without the risk of removing actual string content. There are a few non-standard control codes that do not follow the traditional format (i.e. they end in numbers) thus forcing us to exclude them from the test because we cannot reliably match them.

On the historical side, those ECMA standards were established in the early 90's whereas the VT100, for example, was designed in the mid/late 70's. At that point in time, control codes were still pretty ungoverned and engineers used them for a multitude of things, namely to activate hardware ports that may have been proprietary. Somewhere else you see a similar 'anarchy' of codes is in the x86 architecture for processors; there are a ton of "interrupts" that can mean different things on certain brands of processors, most of which have been phased out.


## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [Josh Junon](https://github.com/qix-)


---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-ansi-regex?utm_source=npm-ansi-regex&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
aproba
======

A ridiculously light-weight function argument validator

```
var validate = require("aproba")

function myfunc(a, b, c) {
  // `a` must be a string, `b` a number, `c` a function
  validate('SNF', arguments) // [a,b,c] is also valid
}

myfunc('test', 23, function () {}) // ok
myfunc(123, 23, function () {}) // type error
myfunc('test', 23) // missing arg error
myfunc('test', 23, function () {}, true) // too many args error

```

Valid types are:

| type | description
| :--: | :----------
| *    | matches any type
| A    | `Array.isArray` OR an `arguments` object
| S    | typeof == string
| N    | typeof == number
| F    | typeof == function
| O    | typeof == object and not type A and not type E
| B    | typeof == boolean
| E    | `instanceof Error` OR `null` **(special: see below)**
| Z    | == `null`

Validation failures throw one of three exception types, distinguished by a
`code` property of `EMISSINGARG`, `EINVALIDTYPE` or `ETOOMANYARGS`.

If you pass in an invalid type then it will throw with a code of
`EUNKNOWNTYPE`.

If an **error** argument is found and is not null then the remaining
arguments are optional.  That is, if you say `ESO` then that's like using a
non-magical `E` in: `E|ESO|ZSO`.

### But I have optional arguments?!

You can provide more than one signature by separating them with pipes `|`.
If any signature matches the arguments then they'll be considered valid.

So for example, say you wanted to write a signature for
`fs.createWriteStream`.  The docs for it describe it thusly:

```
fs.createWriteStream(path[, options])
```

This would be a signature of `SO|S`.  That is, a string and and object, or
just a string.

Now, if you read the full `fs` docs, you'll see that actually path can ALSO
be a buffer.  And options can be a string, that is:
```
path <String> | <Buffer>
options <String> | <Object>
```

To reproduce this you have to fully enumerate all of the possible
combinations and that implies a signature of `SO|SS|OO|OS|S|O`.  The
awkwardness is a feature: It reminds you of the complexity you're adding to
your API when you do this sort of thing.


### Browser support

This has no dependencies and should work in browsers, though you'll have
noisier stack traces.

### Why this exists

I wanted a very simple argument validator. It needed to do two things:

1. Be more concise and easier to use than assertions

2. Not encourage an infinite bikeshed of DSLs

This is why types are specified by a single character and there's no such
thing as an optional argument. 

This is not intended to validate user data. This is specifically about
asserting the interface of your functions.

If you need greater validation, I encourage you to write them by hand or
look elsewhere.
are-we-there-yet
----------------

Track complex hierarchies of asynchronous task completion statuses.  This is
intended to give you a way of recording and reporting the progress of the big
recursive fan-out and gather type workflows that are so common in async.

What you do with this completion data is up to you, but the most common use case is to
feed it to one of the many progress bar modules.

Most progress bar modules include a rudimentary version of this, but my
needs were more complex.

Usage
=====

```javascript
var TrackerGroup = require("are-we-there-yet").TrackerGroup

var top = new TrackerGroup("program")

var single = top.newItem("one thing", 100)
single.completeWork(20)

console.log(top.completed()) // 0.2

fs.stat("file", function(er, stat) {
  if (er) throw er  
  var stream = top.newStream("file", stat.size)
  console.log(top.completed()) // now 0.1 as single is 50% of the job and is 20% complete
                              // and 50% * 20% == 10%
  fs.createReadStream("file").pipe(stream).on("data", function (chunk) {
    // do stuff with chunk
  })
  top.on("change", function (name) {
    // called each time a chunk is read from "file"
    // top.completed() will start at 0.1 and fill up to 0.6 as the file is read
  })
})
```

Shared Methods
==============

* var completed = tracker.completed()

Implemented in: `Tracker`, `TrackerGroup`, `TrackerStream`

Returns the ratio of completed work to work to be done. Range of 0 to 1.

* tracker.finish()

Implemented in: `Tracker`, `TrackerGroup`

Marks the tracker as completed. With a TrackerGroup this marks all of its
components as completed.

Marks all of the components of this tracker as finished, which in turn means
that `tracker.completed()` for this will now be 1.

This will result in one or more `change` events being emitted.

Events
======

All tracker objects emit `change` events with the following arguments:

```
function (name, completed, tracker)
```

`name` is the name of the tracker that originally emitted the event,
or if it didn't have one, the first containing tracker group that had one.

`completed` is the percent complete (as returned by `tracker.completed()` method).

`tracker` is the tracker object that you are listening for events on.

TrackerGroup
============

* var tracker = new TrackerGroup(**name**)

  * **name** *(optional)* - The name of this tracker group, used in change
    notifications if the component updating didn't have a name. Defaults to undefined.

Creates a new empty tracker aggregation group. These are trackers whose
completion status is determined by the completion status of other trackers added to this aggregation group.

Ex.

```javascript
var tracker = new TrackerGroup("parent")
var foo = tracker.newItem("firstChild", 100)
var bar = tracker.newItem("secondChild", 100)

foo.finish()
console.log(tracker.completed()) // 0.5
bar.finish()
console.log(tracker.completed()) // 1
```

* tracker.addUnit(**otherTracker**, **weight**)

  * **otherTracker** - Any of the other are-we-there-yet tracker objects
  * **weight** *(optional)* - The weight to give the tracker, defaults to 1.

Adds the **otherTracker** to this aggregation group. The weight determines
how long you expect this tracker to take to complete in proportion to other
units.  So for instance, if you add one tracker with a weight of 1 and
another with a weight of 2, you're saying the second will take twice as long
to complete as the first.  As such, the first will account for 33% of the
completion of this tracker and the second will account for the other 67%.

Returns **otherTracker**.

* var subGroup = tracker.newGroup(**name**, **weight**)

The above is exactly equivalent to:

```javascript
  var subGroup = tracker.addUnit(new TrackerGroup(name), weight)
```

* var subItem = tracker.newItem(**name**, **todo**, **weight**)

The above is exactly equivalent to:

```javascript
  var subItem = tracker.addUnit(new Tracker(name, todo), weight)
```

* var subStream = tracker.newStream(**name**, **todo**, **weight**)

The above is exactly equivalent to:

```javascript
  var subStream = tracker.addUnit(new TrackerStream(name, todo), weight)
```

* console.log( tracker.debug() )

Returns a tree showing the completion of this tracker group and all of its
children, including recursively entering all of the children.

Tracker
=======

* var tracker = new Tracker(**name**, **todo**)

  * **name** *(optional)* The name of this counter to report in change
    events.  Defaults to undefined.
  * **todo** *(optional)* The amount of work todo (a number). Defaults to 0.

Ordinarily these are constructed as a part of a tracker group (via
`newItem`).

* var completed = tracker.completed()

Returns the ratio of completed work to work to be done. Range of 0 to 1. If
total work to be done is 0 then it will return 0.

* tracker.addWork(**todo**)

  * **todo** A number to add to the amount of work to be done.

Increases the amount of work to be done, thus decreasing the completion
percentage.  Triggers a `change` event.

* tracker.completeWork(**completed**)

  * **completed** A number to add to the work complete

Increase the amount of work complete, thus increasing the completion percentage.
Will never increase the work completed past the amount of work todo. That is,
percentages > 100% are not allowed. Triggers a `change` event.

* tracker.finish()

Marks this tracker as finished, tracker.completed() will now be 1. Triggers
a `change` event.

TrackerStream
=============

* var tracker = new TrackerStream(**name**, **size**, **options**)

  * **name** *(optional)* The name of this counter to report in change
    events.  Defaults to undefined.
  * **size** *(optional)* The number of bytes being sent through this stream.
  * **options** *(optional)* A hash of stream options

The tracker stream object is a pass through stream that updates an internal
tracker object each time a block passes through.  It's intended to track
downloads, file extraction and other related activities. You use it by piping
your data source into it and then using it as your data source.

If your data has a length attribute then that's used as the amount of work
completed when the chunk is passed through.  If it does not (eg, object
streams) then each chunk counts as completing 1 unit of work, so your size
should be the total number of objects being streamed.

* tracker.addWork(**todo**)

  * **todo** Increase the expected overall size by **todo** bytes.

Increases the amount of work to be done, thus decreasing the completion
percentage.  Triggers a `change` event.
# Array Flatten

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Flatten an array of nested arrays into a single flat array. Accepts an optional depth.

## Installation

```
npm install array-flatten --save
```

## Usage

```javascript
var flatten = require('array-flatten')

flatten([1, [2, [3, [4, [5], 6], 7], 8], 9])
//=> [1, 2, 3, 4, 5, 6, 7, 8, 9]

flatten([1, [2, [3, [4, [5], 6], 7], 8], 9], 2)
//=> [1, 2, 3, [4, [5], 6], 7, 8, 9]

(function () {
  flatten(arguments) //=> [1, 2, 3]
})(1, [2, 3])
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/array-flatten.svg?style=flat
[npm-url]: https://npmjs.org/package/array-flatten
[downloads-image]: https://img.shields.io/npm/dm/array-flatten.svg?style=flat
[downloads-url]: https://npmjs.org/package/array-flatten
[travis-image]: https://img.shields.io/travis/blakeembrey/array-flatten.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/array-flatten
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/array-flatten.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/array-flatten?branch=master
# balanced-match

Match balanced string pairs, like `{` and `}` or `<b>` and `</b>`. Supports regular expressions as well!

[![build status](https://secure.travis-ci.org/juliangruber/balanced-match.svg)](http://travis-ci.org/juliangruber/balanced-match)
[![downloads](https://img.shields.io/npm/dm/balanced-match.svg)](https://www.npmjs.org/package/balanced-match)

[![testling badge](https://ci.testling.com/juliangruber/balanced-match.png)](https://ci.testling.com/juliangruber/balanced-match)

## Example

Get the first matching pair of braces:

```js
var balanced = require('balanced-match');

console.log(balanced('{', '}', 'pre{in{nested}}post'));
console.log(balanced('{', '}', 'pre{first}between{second}post'));
console.log(balanced(/\s+\{\s+/, /\s+\}\s+/, 'pre  {   in{nest}   }  post'));
```

The matches are:

```bash
$ node example.js
{ start: 3, end: 14, pre: 'pre', body: 'in{nested}', post: 'post' }
{ start: 3,
  end: 9,
  pre: 'pre',
  body: 'first',
  post: 'between{second}post' }
{ start: 3, end: 17, pre: 'pre', body: 'in{nest}', post: 'post' }
```

## API

### var m = balanced(a, b, str)

For the first non-nested matching pair of `a` and `b` in `str`, return an
object with those keys:

* **start** the index of the first match of `a`
* **end** the index of the matching `b`
* **pre** the preamble, `a` and `b` not included
* **body** the match, `a` and `b` not included
* **post** the postscript, `a` and `b` not included

If there's no match, `undefined` will be returned.

If the `str` contains more `a` than `b` / there are unmatched pairs, the first match that was closed will be used. For example, `{{a}` will match `['{', 'a', '']` and `{a}}` will match `['', 'a', '}']`.

### var r = balanced.range(a, b, str)

For the first non-nested matching pair of `a` and `b` in `str`, return an
array with indexes: `[ <a index>, <b index> ]`.

If there's no match, `undefined` will be returned.

If the `str` contains more `a` than `b` / there are unmatched pairs, the first match that was closed will be used. For example, `{{a}` will match `[ 1, 3 ]` and `{a}}` will match `[0, 2]`.

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install balanced-match
```

## Security contact information

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
base64-js
=========

`base64-js` does basic base64 encoding/decoding in pure JS.

[![build status](https://secure.travis-ci.org/beatgammit/base64-js.png)](http://travis-ci.org/beatgammit/base64-js)

Many browsers already have base64 encoding/decoding functionality, but it is for text data, not all-purpose binary data.

Sometimes encoding/decoding binary data in the browser is useful, and that is what this module does.

## install

With [npm](https://npmjs.org) do:

`npm install base64-js` and `var base64js = require('base64-js')`

For use in web browsers do:

`<script src="base64js.min.js"></script>`

[Get supported base64-js with the Tidelift Subscription](https://tidelift.com/subscription/pkg/npm-base64-js?utm_source=npm-base64-js&utm_medium=referral&utm_campaign=readme)

## methods

`base64js` has three exposed functions, `byteLength`, `toByteArray` and `fromByteArray`, which both take a single argument.

* `byteLength` - Takes a base64 string and returns length of byte array
* `toByteArray` - Takes a base64 string and returns a byte array
* `fromByteArray` - Takes a byte array and returns a base64 string

## license

MIT
# node.bcrypt.js
[![Build Status](https://travis-ci.org/kelektiv/node.bcrypt.js.svg?branch=master)](https://travis-ci.org/kelektiv/node.bcrypt.js)
[![Dependency Status](https://david-dm.org/kelektiv/node.bcrypt.js.svg)](https://david-dm.org/kelektiv/node.bcrypt.js)

A library to help you hash passwords.

You can read about [bcrypt in Wikipedia][bcryptwiki] as well as in the following article:
[How To Safely Store A Password][codahale]

## If You Are Submitting Bugs or Issues

Verify that the node version you are using is a _stable_ version; it has an even major release number. Unstable versions are currently not supported and issues created while using an unstable version will be closed.

If you are on a stable version of node, please provide a sufficient code snippet or log files for installation issues. The code snippet does not require you to include confidential information. However, it must provide enough information such that the problem can be replicable. Issues which are closed without resolution often lack required information for replication.


## Version Compatibility

| Node Version   |   Bcrypt Version  |
| -------------- | ------------------|
| 0.4            | <= 0.4            |
| 0.6, 0.8, 0.10 | >= 0.5            |
| 0.11           | >= 0.8            |
| 4              | <= 2.1.0          |
| 8              | >= 1.0.3 < 4.0.0  |
| 10, 11         | >= 3              |
| 12 onwards     | >= 3.0.6          |

`node-gyp` only works with stable/released versions of node. Since the `bcrypt` module uses `node-gyp` to build and install, you'll need a stable version of node to use bcrypt. If you do not, you'll likely see an error that starts with:

```
gyp ERR! stack Error: "pre" versions of node cannot be installed, use the --nodedir flag instead
```

## Security Issues And Concerns

> Per bcrypt implementation, only the first 72 bytes of a string are used. Any extra bytes are ignored when matching passwords. Note that this is not the first 72 *characters*. It is possible for a string to contain less than 72 characters, while taking up more than 72 bytes (e.g. a UTF-8 encoded string containing emojis).

As should be the case with any security tool, this library should be scrutinized by anyone using it. If you find or suspect an issue with the code, please bring it to my attention and I'll spend some time trying to make sure that this tool is as secure as possible.

To make it easier for people using this tool to analyze what has been surveyed, here is a list of BCrypt related security issues/concerns as they've come up.

* An [issue with passwords][jtr] was found with a version of the Blowfish algorithm developed for John the Ripper. This is not present in the OpenBSD version and is thus not a problem for this module. HT [zooko][zooko].
* Versions `< 5.0.0` suffer from bcrypt wrap-around bug and _will truncate passwords >= 255 characters leading to severely weakened passwords_. Please upgrade at  earliest. See [this wiki page][wrap-around-bug] for more details.
* Versions `< 5.0.0` _do not handle NUL characters inside passwords properly leading to all subsequent characters being dropped and thus resulting in severely  weakened passwords_. Please upgrade at earliest. See [this wiki page][improper-nuls] for more details.

## Compatibility Note

This library supports `$2a$` and `$2b$` prefix bcrypt hashes. `$2x$` and `$2y$` hashes are specific to bcrypt implementation developed for John the Ripper. In theory, they should be compatible with `$2b$` prefix.

Compatibility with hashes generated by other languages is not 100% guaranteed due to difference in character encodings. However, it should not be an issue for most cases.

### Migrating from v1.0.x

Hashes generated in earlier version of `bcrypt` remain 100% supported in `v2.x.x` and later versions. In most cases, the migration should be a bump in the `package.json`.

Hashes generated in `v2.x.x` using the defaults parameters will not work in earlier versions.

## Dependencies

* NodeJS
* `node-gyp`
 * Please check the dependencies for this tool at: https://github.com/nodejs/node-gyp
  * Windows users will need the options for c# and c++ installed with their visual studio instance.
  * Python 2.x
* `OpenSSL` - This is only required to build the `bcrypt` project if you are using versions <= 0.7.7. Otherwise, we're using the builtin node crypto bindings for seed data (which use the same OpenSSL code paths we were, but don't have the external dependency).

## Install via NPM

```
npm install bcrypt
```
***Note:*** OS X users using Xcode 4.3.1 or above may need to run the following command in their terminal prior to installing if errors occur regarding xcodebuild: ```sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer```

_Pre-built binaries for various NodeJS versions are made available on a best-effort basis._

Only the current stable and supported LTS releases are actively tested against. Please note that there may be an interval between the release of the module and the availabilty of the compiled modules.

Currently, we have pre-built binaries that support the following platforms:

1. Windows x32 and x64
2. Linux x64 (GlibC targets only). Pre-built binaries for MUSL targets such as Apline Linux are not available.
3. macOS

If you face an error like this:

```
node-pre-gyp ERR! Tried to download(404): https://github.com/kelektiv/node.bcrypt.js/releases/download/v1.0.2/bcrypt_lib-v1.0.2-node-v48-linux-x64.tar.gz
```

make sure you have the appropriate dependencies installed and configured for your platform. You can find installation instructions for the dependencies for some common platforms [in this page][depsinstall].

## Usage

### async (recommended)

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
```

#### To hash a password:

Technique 1 (generate a salt and hash on separate function calls):

```javascript
bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        // Store hash in your password DB.
    });
});
```

Technique 2 (auto-gen a salt and hash):

```javascript
bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
});
```

Note that both techniques achieve the same end-result.

#### To check a password:

```javascript
// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
    // result == true
});
bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
    // result == false
});
```

[A Note on Timing Attacks](#a-note-on-timing-attacks)

### with promises

bcrypt uses whatever Promise implementation is available in `global.Promise`. NodeJS >= 0.12 has a native Promise implementation built in. However, this should work in any Promises/A+ compliant implementation.

Async methods that accept a callback, return a `Promise` when callback is not specified if Promise support is available.

```javascript
bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {
    // Store hash in your password DB.
});
```
```javascript
// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash).then(function(result) {
    // result == true
});
bcrypt.compare(someOtherPlaintextPassword, hash).then(function(result) {
    // result == false
});
```

This is also compatible with `async/await`

```javascript
async function checkUser(username, password) {
    //... fetch user from a db etc.

    const match = await bcrypt.compare(password, user.passwordHash);

    if(match) {
        //login
    }

    //...
}
```

### sync

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
```

#### To hash a password:

Technique 1 (generate a salt and hash on separate function calls):

```javascript
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(myPlaintextPassword, salt);
// Store hash in your password DB.
```

Technique 2 (auto-gen a salt and hash):

```javascript
const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
// Store hash in your password DB.
```

As with async, both techniques achieve the same end-result.

#### To check a password:

```javascript
// Load hash from your password DB.
bcrypt.compareSync(myPlaintextPassword, hash); // true
bcrypt.compareSync(someOtherPlaintextPassword, hash); // false
```

[A Note on Timing Attacks](#a-note-on-timing-attacks)

### Why is async mode recommended over sync mode?
If you are using bcrypt on a simple script, using the sync mode is perfectly fine. However, if you are using bcrypt on a server, the async mode is recommended. This is because the hashing done by bcrypt is CPU intensive, so the sync version will block the event loop and prevent your application from servicing any other inbound requests or events. The async version uses a thread pool which does not block the main event loop.

## API

`BCrypt.`

  * `genSaltSync(rounds, minor)`
    * `rounds` - [OPTIONAL] - the cost of processing the data. (default - 10)
    * `minor` - [OPTIONAL] - minor version of bcrypt to use. (default - b)
  * `genSalt(rounds, minor, cb)`
    * `rounds` - [OPTIONAL] - the cost of processing the data. (default - 10)
    * `minor` - [OPTIONAL] - minor version of bcrypt to use. (default - b)
    * `cb` - [OPTIONAL] - a callback to be fired once the salt has been generated. uses eio making it asynchronous. If `cb` is not specified, a `Promise` is returned if Promise support is available.
      * `err` - First parameter to the callback detailing any errors.
      * `salt` - Second parameter to the callback providing the generated salt.
  * `hashSync(data, salt)`
    * `data` - [REQUIRED] - the data to be encrypted.
    * `salt` - [REQUIRED] - the salt to be used to hash the password. if specified as a number then a salt will be generated with the specified number of rounds and used (see example under **Usage**).
  * `hash(data, salt, cb)`
    * `data` - [REQUIRED] - the data to be encrypted.
    * `salt` - [REQUIRED] - the salt to be used to hash the password. if specified as a number then a salt will be generated with the specified number of rounds and used (see example under **Usage**).
    * `cb` - [OPTIONAL] - a callback to be fired once the data has been encrypted. uses eio making it asynchronous. If `cb` is not specified, a `Promise` is returned if Promise support is available.
      * `err` - First parameter to the callback detailing any errors.
      * `encrypted` - Second parameter to the callback providing the encrypted form.
  * `compareSync(data, encrypted)`
    * `data` - [REQUIRED] - data to compare.
    * `encrypted` - [REQUIRED] - data to be compared to.
  * `compare(data, encrypted, cb)`
    * `data` - [REQUIRED] - data to compare.
    * `encrypted` - [REQUIRED] - data to be compared to.
    * `cb` - [OPTIONAL] - a callback to be fired once the data has been compared. uses eio making it asynchronous. If `cb` is not specified, a `Promise` is returned if Promise support is available.
      * `err` - First parameter to the callback detailing any errors.
      * `same` - Second parameter to the callback providing whether the data and encrypted forms match [true | false].
  * `getRounds(encrypted)` - return the number of rounds used to encrypt a given hash
    * `encrypted` - [REQUIRED] - hash from which the number of rounds used should be extracted.

## A Note on Rounds

A note about the cost. When you are hashing your data the module will go through a series of rounds to give you a secure hash. The value you submit there is not just the number of rounds that the module will go through to hash your data. The module will use the value you enter and go through `2^rounds` iterations of processing.

From @garthk, on a 2GHz core you can roughly expect:

    rounds=8 : ~40 hashes/sec
    rounds=9 : ~20 hashes/sec
    rounds=10: ~10 hashes/sec
    rounds=11: ~5  hashes/sec
    rounds=12: 2-3 hashes/sec
    rounds=13: ~1 sec/hash
    rounds=14: ~1.5 sec/hash
    rounds=15: ~3 sec/hash
    rounds=25: ~1 hour/hash
    rounds=31: 2-3 days/hash


## A Note on Timing Attacks

Because it's come up multiple times in this project, and other bcrypt projects, it needs to be said. The bcrypt comparison function is not susceptible to timing attacks. From codahale/bcrypt-ruby#42:

> One of the desired properties of a cryptographic hash function is preimage attack resistance, which means there is no shortcut for generating a message which, when hashed, produces a specific digest.

A great thread on this, in much more detail can be found @ codahale/bcrypt-ruby#43

If you're unfamiliar with timing attacks and want to learn more you can find a great writeup @ [A Lesson In Timing Attacks][timingatk]

However, timing attacks are real. And, the comparison function is _not_ time safe. What that means is that it may exit the function early in the comparison process. This happens because of the above. We don't need to be careful that an attacker is going to learn anything, and our comparison function serves to provide a comparison of hashes, it is a utility to the overall purpose of the library. If you end up using it for something else we cannot guarantee the security of the comparator. Keep that in mind as you use the library.

## Hash Info

The characters that comprise the resultant hash are `./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$`.

Resultant hashes will be 60 characters long and they will include the salt among other parameters, as follows:

`$[algorithm]$[cost]$[salt][hash]`

- 2 chars hash algorithm identifier prefix. `"$2a$" or "$2b$"` indicates BCrypt
- Cost-factor (n). Represents the exponent used to determine how many iterations 2^n
- 16-byte (128-bit) salt, base64 encoded to 22 characters
- 24-byte (192-bit) hash, base64 encoded to 31 characters

Example:
```
$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |                     |
 |  |  |                     hash-value = K0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |
 |  |  salt = nOUIs5kJ7naTuTFkBy1veu
 |  |
 |  cost-factor => 10 = 2^10 rounds
 |
 hash-algorithm identifier => 2b = BCrypt
```

## Testing

If you create a pull request, tests better pass :)

```
npm install
npm test
```

## Credits

The code for this comes from a few sources:

* blowfish.cc - OpenBSD
* bcrypt.cc - OpenBSD
* bcrypt::gen_salt - [gen_salt inclusion to bcrypt][bcryptgs]
* bcrypt_node.cc - me

## Contributors

* [Antonio Salazar Cardozo][shadowfiend] - Early MacOS X support (when we used libbsd)
* [Ben Glow][pixelglow] - Fixes for thread safety with async calls
* [Van Nguyen][thegoleffect] - Found a timing attack in the comparator
* [NewITFarmer][newitfarmer] - Initial Cygwin support
* [David Trejo][dtrejo] - packaging fixes
* [Alfred Westerveld][alfredwesterveld] - packaging fixes
* [Vincent Côté-Roy][vincentr] - Testing around concurrency issues
* [Lloyd Hilaiel][lloyd] - Documentation fixes
* [Roman Shtylman][shtylman] - Code refactoring, general rot reduction, compile options, better memory management with delete and new, and an upgrade to libuv over eio/ev.
* [Vadim Graboys][vadimg] - Code changes to support 0.5.5+
* [Ben Noordhuis][bnoordhuis] - Fixed a thread safety issue in nodejs that was perfectly mappable to this module.
* [Nate Rajlich][tootallnate] - Bindings and build process.
* [Sean McArthur][seanmonstar] - Windows Support
* [Fanie Oosthuysen][weareu] - Windows Support
* [Amitosh Swain Mahapatra][agathver] - $2b$ hash support, ES6 Promise support
* [Nicola Del Gobbo][NickNaso] - Initial implementation with N-API

## License
Unless stated elsewhere, file headers or otherwise, the license as stated in the LICENSE file.

[bcryptwiki]: https://en.wikipedia.org/wiki/Bcrypt
[bcryptgs]: http://mail-index.netbsd.org/tech-crypto/2002/05/24/msg000204.html
[codahale]: http://codahale.com/how-to-safely-store-a-password/
[gh13]: https://github.com/ncb000gt/node.bcrypt.js/issues/13
[jtr]: http://www.openwall.com/lists/oss-security/2011/06/20/2
[depsinstall]: https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions
[timingatk]: https://codahale.com/a-lesson-in-timing-attacks/
[wrap-around-bug]: https://github.com/kelektiv/node.bcrypt.js/wiki/Security-Issues-and-Concerns#bcrypt-wrap-around-bug-medium-severity
[improper-nuls]: https://github.com/kelektiv/node.bcrypt.js/wiki/Security-Issues-and-Concerns#improper-nul-handling-medium-severity

[shadowfiend]:https://github.com/Shadowfiend
[thegoleffect]:https://github.com/thegoleffect
[pixelglow]:https://github.com/pixelglow
[dtrejo]:https://github.com/dtrejo
[alfredwesterveld]:https://github.com/alfredwesterveld
[newitfarmer]:https://github.com/newitfarmer
[zooko]:https://twitter.com/zooko
[vincentr]:https://twitter.com/vincentcr
[lloyd]:https://github.com/lloyd
[shtylman]:https://github.com/shtylman
[vadimg]:https://github.com/vadimg
[bnoordhuis]:https://github.com/bnoordhuis
[tootallnate]:https://github.com/tootallnate
[seanmonstar]:https://github.com/seanmonstar
[weareu]:https://github.com/weareu
[agathver]:https://github.com/Agathver
[NickNaso]: https://github.com/NickNaso
# body-parser

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Node.js body parsing middleware.

Parse incoming request bodies in a middleware before your handlers, available
under the `req.body` property.

**Note** As `req.body`'s shape is based on user-controlled input, all
properties and values in this object are untrusted and should be validated
before trusting. For example, `req.body.foo.toString()` may fail in multiple
ways, for example the `foo` property may not be there or may not be a string,
and `toString` may not be a function and instead a string or other user input.

[Learn about the anatomy of an HTTP transaction in Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

_This does not handle multipart bodies_, due to their complex and typically
large nature. For multipart bodies, you may be interested in the following
modules:

  * [busboy](https://www.npmjs.org/package/busboy#readme) and
    [connect-busboy](https://www.npmjs.org/package/connect-busboy#readme)
  * [multiparty](https://www.npmjs.org/package/multiparty#readme) and
    [connect-multiparty](https://www.npmjs.org/package/connect-multiparty#readme)
  * [formidable](https://www.npmjs.org/package/formidable#readme)
  * [multer](https://www.npmjs.org/package/multer#readme)

This module provides the following parsers:

  * [JSON body parser](#bodyparserjsonoptions)
  * [Raw body parser](#bodyparserrawoptions)
  * [Text body parser](#bodyparsertextoptions)
  * [URL-encoded form body parser](#bodyparserurlencodedoptions)

Other body parsers you might be interested in:

- [body](https://www.npmjs.org/package/body#readme)
- [co-body](https://www.npmjs.org/package/co-body#readme)

## Installation

```sh
$ npm install body-parser
```

## API

```js
var bodyParser = require('body-parser')
```

The `bodyParser` object exposes various factories to create middlewares. All
middlewares will populate the `req.body` property with the parsed body when
the `Content-Type` request header matches the `type` option, or an empty
object (`{}`) if there was no body to parse, the `Content-Type` was not matched,
or an error occurred.

The various errors returned by this module are described in the
[errors section](#errors).

### bodyParser.json([options])

Returns middleware that only parses `json` and only looks at requests where
the `Content-Type` header matches the `type` option. This parser accepts any
Unicode encoding of the body and supports automatic inflation of `gzip` and
`deflate` encodings.

A new `body` object containing the parsed data is populated on the `request`
object after the middleware (i.e. `req.body`).

#### Options

The `json` function takes an optional `options` object that may contain any of
the following keys:

##### inflate

When set to `true`, then deflated (compressed) bodies will be inflated; when
`false`, deflated bodies are rejected. Defaults to `true`.

##### limit

Controls the maximum request body size. If this is a number, then the value
specifies the number of bytes; if it is a string, the value is passed to the
[bytes](https://www.npmjs.com/package/bytes) library for parsing. Defaults
to `'100kb'`.

##### reviver

The `reviver` option is passed directly to `JSON.parse` as the second
argument. You can find more information on this argument
[in the MDN documentation about JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).

##### strict

When set to `true`, will only accept arrays and objects; when `false` will
accept anything `JSON.parse` accepts. Defaults to `true`.

##### type

The `type` option is used to determine what media type the middleware will
parse. This option can be a string, array of strings, or a function. If not a
function, `type` option is passed directly to the
[type-is](https://www.npmjs.org/package/type-is#readme) library and this can
be an extension name (like `json`), a mime type (like `application/json`), or
a mime type with a wildcard (like `*/*` or `*/json`). If a function, the `type`
option is called as `fn(req)` and the request is parsed if it returns a truthy
value. Defaults to `application/json`.

##### verify

The `verify` option, if supplied, is called as `verify(req, res, buf, encoding)`,
where `buf` is a `Buffer` of the raw request body and `encoding` is the
encoding of the request. The parsing can be aborted by throwing an error.

### bodyParser.raw([options])

Returns middleware that parses all bodies as a `Buffer` and only looks at
requests where the `Content-Type` header matches the `type` option. This
parser supports automatic inflation of `gzip` and `deflate` encodings.

A new `body` object containing the parsed data is populated on the `request`
object after the middleware (i.e. `req.body`). This will be a `Buffer` object
of the body.

#### Options

The `raw` function takes an optional `options` object that may contain any of
the following keys:

##### inflate

When set to `true`, then deflated (compressed) bodies will be inflated; when
`false`, deflated bodies are rejected. Defaults to `true`.

##### limit

Controls the maximum request body size. If this is a number, then the value
specifies the number of bytes; if it is a string, the value is passed to the
[bytes](https://www.npmjs.com/package/bytes) library for parsing. Defaults
to `'100kb'`.

##### type

The `type` option is used to determine what media type the middleware will
parse. This option can be a string, array of strings, or a function.
If not a function, `type` option is passed directly to the
[type-is](https://www.npmjs.org/package/type-is#readme) library and this
can be an extension name (like `bin`), a mime type (like
`application/octet-stream`), or a mime type with a wildcard (like `*/*` or
`application/*`). If a function, the `type` option is called as `fn(req)`
and the request is parsed if it returns a truthy value. Defaults to
`application/octet-stream`.

##### verify

The `verify` option, if supplied, is called as `verify(req, res, buf, encoding)`,
where `buf` is a `Buffer` of the raw request body and `encoding` is the
encoding of the request. The parsing can be aborted by throwing an error.

### bodyParser.text([options])

Returns middleware that parses all bodies as a string and only looks at
requests where the `Content-Type` header matches the `type` option. This
parser supports automatic inflation of `gzip` and `deflate` encodings.

A new `body` string containing the parsed data is populated on the `request`
object after the middleware (i.e. `req.body`). This will be a string of the
body.

#### Options

The `text` function takes an optional `options` object that may contain any of
the following keys:

##### defaultCharset

Specify the default character set for the text content if the charset is not
specified in the `Content-Type` header of the request. Defaults to `utf-8`.

##### inflate

When set to `true`, then deflated (compressed) bodies will be inflated; when
`false`, deflated bodies are rejected. Defaults to `true`.

##### limit

Controls the maximum request body size. If this is a number, then the value
specifies the number of bytes; if it is a string, the value is passed to the
[bytes](https://www.npmjs.com/package/bytes) library for parsing. Defaults
to `'100kb'`.

##### type

The `type` option is used to determine what media type the middleware will
parse. This option can be a string, array of strings, or a function. If not
a function, `type` option is passed directly to the
[type-is](https://www.npmjs.org/package/type-is#readme) library and this can
be an extension name (like `txt`), a mime type (like `text/plain`), or a mime
type with a wildcard (like `*/*` or `text/*`). If a function, the `type`
option is called as `fn(req)` and the request is parsed if it returns a
truthy value. Defaults to `text/plain`.

##### verify

The `verify` option, if supplied, is called as `verify(req, res, buf, encoding)`,
where `buf` is a `Buffer` of the raw request body and `encoding` is the
encoding of the request. The parsing can be aborted by throwing an error.

### bodyParser.urlencoded([options])

Returns middleware that only parses `urlencoded` bodies and only looks at
requests where the `Content-Type` header matches the `type` option. This
parser accepts only UTF-8 encoding of the body and supports automatic
inflation of `gzip` and `deflate` encodings.

A new `body` object containing the parsed data is populated on the `request`
object after the middleware (i.e. `req.body`). This object will contain
key-value pairs, where the value can be a string or array (when `extended` is
`false`), or any type (when `extended` is `true`).

#### Options

The `urlencoded` function takes an optional `options` object that may contain
any of the following keys:

##### extended

The `extended` option allows to choose between parsing the URL-encoded data
with the `querystring` library (when `false`) or the `qs` library (when
`true`). The "extended" syntax allows for rich objects and arrays to be
encoded into the URL-encoded format, allowing for a JSON-like experience
with URL-encoded. For more information, please
[see the qs library](https://www.npmjs.org/package/qs#readme).

Defaults to `true`, but using the default has been deprecated. Please
research into the difference between `qs` and `querystring` and choose the
appropriate setting.

##### inflate

When set to `true`, then deflated (compressed) bodies will be inflated; when
`false`, deflated bodies are rejected. Defaults to `true`.

##### limit

Controls the maximum request body size. If this is a number, then the value
specifies the number of bytes; if it is a string, the value is passed to the
[bytes](https://www.npmjs.com/package/bytes) library for parsing. Defaults
to `'100kb'`.

##### parameterLimit

The `parameterLimit` option controls the maximum number of parameters that
are allowed in the URL-encoded data. If a request contains more parameters
than this value, a 413 will be returned to the client. Defaults to `1000`.

##### type

The `type` option is used to determine what media type the middleware will
parse. This option can be a string, array of strings, or a function. If not
a function, `type` option is passed directly to the
[type-is](https://www.npmjs.org/package/type-is#readme) library and this can
be an extension name (like `urlencoded`), a mime type (like
`application/x-www-form-urlencoded`), or a mime type with a wildcard (like
`*/x-www-form-urlencoded`). If a function, the `type` option is called as
`fn(req)` and the request is parsed if it returns a truthy value. Defaults
to `application/x-www-form-urlencoded`.

##### verify

The `verify` option, if supplied, is called as `verify(req, res, buf, encoding)`,
where `buf` is a `Buffer` of the raw request body and `encoding` is the
encoding of the request. The parsing can be aborted by throwing an error.

## Errors

The middlewares provided by this module create errors using the
[`http-errors` module](https://www.npmjs.com/package/http-errors). The errors
will typically have a `status`/`statusCode` property that contains the suggested
HTTP response code, an `expose` property to determine if the `message` property
should be displayed to the client, a `type` property to determine the type of
error without matching against the `message`, and a `body` property containing
the read body, if available.

The following are the common errors created, though any error can come through
for various reasons.

### content encoding unsupported

This error will occur when the request had a `Content-Encoding` header that
contained an encoding but the "inflation" option was set to `false`. The
`status` property is set to `415`, the `type` property is set to
`'encoding.unsupported'`, and the `charset` property will be set to the
encoding that is unsupported.

### entity parse failed

This error will occur when the request contained an entity that could not be
parsed by the middleware. The `status` property is set to `400`, the `type`
property is set to `'entity.parse.failed'`, and the `body` property is set to
the entity value that failed parsing.

### entity verify failed

This error will occur when the request contained an entity that could not be
failed verification by the defined `verify` option. The `status` property is
set to `403`, the `type` property is set to `'entity.verify.failed'`, and the
`body` property is set to the entity value that failed verification.

### request aborted

This error will occur when the request is aborted by the client before reading
the body has finished. The `received` property will be set to the number of
bytes received before the request was aborted and the `expected` property is
set to the number of expected bytes. The `status` property is set to `400`
and `type` property is set to `'request.aborted'`.

### request entity too large

This error will occur when the request body's size is larger than the "limit"
option. The `limit` property will be set to the byte limit and the `length`
property will be set to the request body's length. The `status` property is
set to `413` and the `type` property is set to `'entity.too.large'`.

### request size did not match content length

This error will occur when the request's length did not match the length from
the `Content-Length` header. This typically occurs when the request is malformed,
typically when the `Content-Length` header was calculated based on characters
instead of bytes. The `status` property is set to `400` and the `type` property
is set to `'request.size.invalid'`.

### stream encoding should not be set

This error will occur when something called the `req.setEncoding` method prior
to this middleware. This module operates directly on bytes only and you cannot
call `req.setEncoding` when using this module. The `status` property is set to
`500` and the `type` property is set to `'stream.encoding.set'`.

### stream is not readable

This error will occur when the request is no longer readable when this middleware
attempts to read it. This typically means something other than a middleware from
this module read the reqest body already and the middleware was also configured to
read the same request. The `status` property is set to `500` and the `type`
property is set to `'stream.not.readable'`.

### too many parameters

This error will occur when the content of the request exceeds the configured
`parameterLimit` for the `urlencoded` parser. The `status` property is set to
`413` and the `type` property is set to `'parameters.too.many'`.

### unsupported charset "BOGUS"

This error will occur when the request had a charset parameter in the
`Content-Type` header, but the `iconv-lite` module does not support it OR the
parser does not support it. The charset is contained in the message as well
as in the `charset` property. The `status` property is set to `415`, the
`type` property is set to `'charset.unsupported'`, and the `charset` property
is set to the charset that is unsupported.

### unsupported content encoding "bogus"

This error will occur when the request had a `Content-Encoding` header that
contained an unsupported encoding. The encoding is contained in the message
as well as in the `encoding` property. The `status` property is set to `415`,
the `type` property is set to `'encoding.unsupported'`, and the `encoding`
property is set to the encoding that is unsupported.

## Examples

### Express/Connect top-level generic

This example demonstrates adding a generic JSON and URL-encoded parser as a
top-level middleware, which will parse the bodies of all incoming requests.
This is the simplest setup.

```js
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})
```

### Express route-specific

This example demonstrates adding body parsers specifically to the routes that
need them. In general, this is the most recommended way to use body-parser with
Express.

```js
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
app.post('/login', urlencodedParser, function (req, res) {
  res.send('welcome, ' + req.body.username)
})

// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  // create user in req.body
})
```

### Change accepted type for parsers

All the parsers accept a `type` option which allows you to change the
`Content-Type` that the middleware will parse.

```js
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/body-parser.svg
[npm-url]: https://npmjs.org/package/body-parser
[coveralls-image]: https://img.shields.io/coveralls/expressjs/body-parser/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/body-parser?branch=master
[downloads-image]: https://img.shields.io/npm/dm/body-parser.svg
[downloads-url]: https://npmjs.org/package/body-parser
[github-actions-ci-image]: https://img.shields.io/github/workflow/status/expressjs/body-parser/ci/master?label=ci
[github-actions-ci-url]: https://github.com/expressjs/body-parser/actions/workflows/ci.yml
# brace-expansion

[Brace expansion](https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html), 
as known from sh/bash, in JavaScript.

[![build status](https://secure.travis-ci.org/juliangruber/brace-expansion.svg)](http://travis-ci.org/juliangruber/brace-expansion)
[![downloads](https://img.shields.io/npm/dm/brace-expansion.svg)](https://www.npmjs.org/package/brace-expansion)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliangruber/brace-expansion.svg)](https://greenkeeper.io/)

[![testling badge](https://ci.testling.com/juliangruber/brace-expansion.png)](https://ci.testling.com/juliangruber/brace-expansion)

## Example

```js
var expand = require('brace-expansion');

expand('file-{a,b,c}.jpg')
// => ['file-a.jpg', 'file-b.jpg', 'file-c.jpg']

expand('-v{,,}')
// => ['-v', '-v', '-v']

expand('file{0..2}.jpg')
// => ['file0.jpg', 'file1.jpg', 'file2.jpg']

expand('file-{a..c}.jpg')
// => ['file-a.jpg', 'file-b.jpg', 'file-c.jpg']

expand('file{2..0}.jpg')
// => ['file2.jpg', 'file1.jpg', 'file0.jpg']

expand('file{0..4..2}.jpg')
// => ['file0.jpg', 'file2.jpg', 'file4.jpg']

expand('file-{a..e..2}.jpg')
// => ['file-a.jpg', 'file-c.jpg', 'file-e.jpg']

expand('file{00..10..5}.jpg')
// => ['file00.jpg', 'file05.jpg', 'file10.jpg']

expand('{{A..C},{a..c}}')
// => ['A', 'B', 'C', 'a', 'b', 'c']

expand('ppp{,config,oe{,conf}}')
// => ['ppp', 'pppconfig', 'pppoe', 'pppoeconf']
```

## API

```js
var expand = require('brace-expansion');
```

### var expanded = expand(str)

Return an array of all possible and valid expansions of `str`. If none are
found, `[str]` is returned.

Valid expansions are:

```js
/^(.*,)+(.+)?$/
// {a,b,...}
```

A comma separated list of options, like `{a,b}` or `{a,{b,c}}` or `{,a,}`.

```js
/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/
// {x..y[..incr]}
```

A numeric sequence from `x` to `y` inclusive, with optional increment.
If `x` or `y` start with a leading `0`, all the numbers will be padded
to have equal length. Negative numbers and backwards iteration work too.

```js
/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/
// {x..y[..incr]}
```

An alphabetic sequence from `x` to `y` inclusive, with optional increment.
`x` and `y` must be exactly one character, and if given, `incr` must be a
number.

For compatibility reasons, the string `${` is not eligible for brace expansion.

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install brace-expansion
```

## Contributors

- [Julian Gruber](https://github.com/juliangruber)
- [Isaac Z. Schlueter](https://github.com/isaacs)

## Sponsors

This module is proudly supported by my [Sponsors](https://github.com/juliangruber/sponsors)!

Do you want to support modules like this to improve their quality, stability and weigh in on new features? Then please consider donating to my [Patreon](https://www.patreon.com/juliangruber). Not sure how much of my modules you're using? Try [feross/thanks](https://github.com/feross/thanks)!

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
# BSON parser

BSON is short for "Binary JSON," and is the binary-encoded serialization of JSON-like documents. You can learn more about it in [the specification](http://bsonspec.org).

This browser version of the BSON parser is compiled using [rollup](https://rollupjs.org/) and the current version is pre-compiled in the `dist` directory.

This is the default BSON parser, however, there is a C++ Node.js addon version as well that does not support the browser. It can be found at [mongod-js/bson-ext](https://github.com/mongodb-js/bson-ext).

### Table of Contents
- [Usage](#usage)
- [Bugs/Feature Requests](#bugs--feature-requests)
- [Installation](#installation)
- [Documentation](#documentation)
- [FAQ](#faq)

## Bugs / Feature Requests

Think you've found a bug? Want to see a new feature in `bson`? Please open a case in our issue management tool, JIRA:

1. Create an account and login: [jira.mongodb.org](https://jira.mongodb.org)
2. Navigate to the NODE project: [jira.mongodb.org/browse/NODE](https://jira.mongodb.org/browse/NODE)
3. Click **Create Issue** - Please provide as much information as possible about the issue and how to reproduce it.

Bug reports in JIRA for all driver projects (i.e. NODE, PYTHON, CSHARP, JAVA) and the Core Server (i.e. SERVER) project are **public**.

## Usage

To build a new version perform the following operations:

```
npm install
npm run build
```

### Node (no bundling)
A simple example of how to use BSON in `Node.js`:

```js
const BSON = require('bson');
const Long = BSON.Long;

// Serialize a document
const doc = { long: Long.fromNumber(100) };
const data = BSON.serialize(doc);
console.log('data:', data);

// Deserialize the resulting Buffer
const doc_2 = BSON.deserialize(data);
console.log('doc_2:', doc_2);
```

### Browser (no bundling)

If you are not using a bundler like webpack, you can include `dist/bson.bundle.js` using a script tag.  It includes polyfills for built-in node types like `Buffer`.

```html
<script src="./dist/bson.bundle.js"></script>

<script>
  function start() {
    // Get the Long type
    const Long = BSON.Long;

    // Serialize a document
    const doc = { long: Long.fromNumber(100) }
    const data = BSON.serialize(doc);
    console.log('data:', data);

    // De serialize it again
    const doc_2 = BSON.deserialize(data);
    console.log('doc_2:', doc_2);
  }
</script>
```

### Using webpack

If using webpack, you can use your normal import/require syntax of your project to pull in the `bson` library.

ES6 Example:

```js
import { Long, serialize, deserialize } from 'bson';

// Serialize a document
const doc = { long: Long.fromNumber(100) };
const data = serialize(doc);
console.log('data:', data);

// De serialize it again
const doc_2 = deserialize(data);
console.log('doc_2:', doc_2);
```

ES5 Example:

```js
const BSON = require('bson');
const Long = BSON.Long;

// Serialize a document
const doc = { long: Long.fromNumber(100) };
const data = BSON.serialize(doc);
console.log('data:', data);

// Deserialize the resulting Buffer
const doc_2 = BSON.deserialize(data);
console.log('doc_2:', doc_2);
```

Depending on your settings, webpack will under the hood resolve to one of the following:

- `dist/bson.browser.esm.js` If your project is in the browser and using ES6 modules (Default for `webworker` and `web` targets)
- `dist/bson.browser.umd.js` If your project is in the browser and not using ES6 modules
- `dist/bson.esm.js` If your project is in Node.js and using ES6 modules (Default for `node` targets)
- `lib/bson.js` (the normal include path) If your project is in Node.js and not using ES6 modules

For more information, see [this page on webpack's `resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolvemainfields) and [the `package.json` for this project](./package.json#L52)

### Usage with Angular

Starting with Angular 6, Angular CLI removed the shim for `global` and other node built-in variables (original comment [here](https://github.com/angular/angular-cli/issues/9827#issuecomment-386154063)). If you are using BSON with Angular, you may need to add the following shim to your `polyfills.ts` file:

```js
// In polyfills.ts
(window as any).global = window;
```

- [Original Comment by Angular CLI](https://github.com/angular/angular-cli/issues/9827#issuecomment-386154063)
- [Original Source for Solution](https://stackoverflow.com/a/50488337/4930088)

## Installation

`npm install bson`

## Documentation

### Objects

<dl>
<dt><a href="#EJSON">EJSON</a> : <code>object</code></dt>
<dd></dd>
</dl>

### Functions

<dl>
<dt><a href="#setInternalBufferSize">setInternalBufferSize(size)</a></dt>
<dd><p>Sets the size of the internal serialization buffer.</p>
</dd>
<dt><a href="#serialize">serialize(object)</a> ⇒ <code>Buffer</code></dt>
<dd><p>Serialize a Javascript object.</p>
</dd>
<dt><a href="#serializeWithBufferAndIndex">serializeWithBufferAndIndex(object, buffer)</a> ⇒ <code>Number</code></dt>
<dd><p>Serialize a Javascript object using a predefined Buffer and index into the buffer, useful when pre-allocating the space for serialization.</p>
</dd>
<dt><a href="#deserialize">deserialize(buffer)</a> ⇒ <code>Object</code></dt>
<dd><p>Deserialize data as BSON.</p>
</dd>
<dt><a href="#calculateObjectSize">calculateObjectSize(object)</a> ⇒ <code>Number</code></dt>
<dd><p>Calculate the bson size for a passed in Javascript object.</p>
</dd>
<dt><a href="#deserializeStream">deserializeStream(data, startIndex, numberOfDocuments, documents, docStartIndex, [options])</a> ⇒ <code>Number</code></dt>
<dd><p>Deserialize stream data as BSON documents.</p>
</dd>
</dl>

<a name="EJSON"></a>

### EJSON

* [EJSON](#EJSON)

    * [.parse(text, [options])](#EJSON.parse)

    * [.stringify(value, [replacer], [space], [options])](#EJSON.stringify)

    * [.serialize(bson, [options])](#EJSON.serialize)

    * [.deserialize(ejson, [options])](#EJSON.deserialize)


<a name="EJSON.parse"></a>

#### *EJSON*.parse(text, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  |  |
| [options] | <code>object</code> |  | Optional settings |
| [options.relaxed] | <code>boolean</code> | <code>true</code> | Attempt to return native JS types where possible, rather than BSON types (if true) |

Parse an Extended JSON string, constructing the JavaScript value or object described by that
string.

**Example**
```js
const { EJSON } = require('bson');
const text = '{ "int32": { "$numberInt": "10" } }';

// prints { int32: { [String: '10'] _bsontype: 'Int32', value: '10' } }
console.log(EJSON.parse(text, { relaxed: false }));

// prints { int32: 10 }
console.log(EJSON.parse(text));
```
<a name="EJSON.stringify"></a>

#### *EJSON*.stringify(value, [replacer], [space], [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| value | <code>object</code> |  | The value to convert to extended JSON |
| [replacer] | <code>function</code> \| <code>array</code> |  | A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string |
| [space] | <code>string</code> \| <code>number</code> |  | A String or Number object that's used to insert white space into the output JSON string for readability purposes. |
| [options] | <code>object</code> |  | Optional settings |
| [options.relaxed] | <code>boolean</code> | <code>true</code> | Enabled Extended JSON's `relaxed` mode |
| [options.legacy] | <code>boolean</code> | <code>true</code> | Output in Extended JSON v1 |

Converts a BSON document to an Extended JSON string, optionally replacing values if a replacer
function is specified or optionally including only the specified properties if a replacer array
is specified.

**Example**
```js
const { EJSON } = require('bson');
const Int32 = require('mongodb').Int32;
const doc = { int32: new Int32(10) };

// prints '{"int32":{"$numberInt":"10"}}'
console.log(EJSON.stringify(doc, { relaxed: false }));

// prints '{"int32":10}'
console.log(EJSON.stringify(doc));
```
<a name="EJSON.serialize"></a>

#### *EJSON*.serialize(bson, [options])

| Param | Type | Description |
| --- | --- | --- |
| bson | <code>object</code> | The object to serialize |
| [options] | <code>object</code> | Optional settings passed to the `stringify` function |

Serializes an object to an Extended JSON string, and reparse it as a JavaScript object.

<a name="EJSON.deserialize"></a>

#### *EJSON*.deserialize(ejson, [options])

| Param | Type | Description |
| --- | --- | --- |
| ejson | <code>object</code> | The Extended JSON object to deserialize |
| [options] | <code>object</code> | Optional settings passed to the parse method |

Deserializes an Extended JSON object into a plain JavaScript object with native/BSON types

<a name="setInternalBufferSize"></a>

### setInternalBufferSize(size)

| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> | The desired size for the internal serialization buffer |

Sets the size of the internal serialization buffer.

<a name="serialize"></a>

### serialize(object)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| object | <code>Object</code> |  | the Javascript object to serialize. |
| [options.checkKeys] | <code>Boolean</code> |  | the serializer will check if keys are valid. |
| [options.serializeFunctions] | <code>Boolean</code> | <code>false</code> | serialize the javascript functions **(default:false)**. |
| [options.ignoreUndefined] | <code>Boolean</code> | <code>true</code> | ignore undefined fields **(default:true)**. |

Serialize a Javascript object.

**Returns**: <code>Buffer</code> - returns the Buffer object containing the serialized object.
<a name="serializeWithBufferAndIndex"></a>

### serializeWithBufferAndIndex(object, buffer)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| object | <code>Object</code> |  | the Javascript object to serialize. |
| buffer | <code>Buffer</code> |  | the Buffer you pre-allocated to store the serialized BSON object. |
| [options.checkKeys] | <code>Boolean</code> |  | the serializer will check if keys are valid. |
| [options.serializeFunctions] | <code>Boolean</code> | <code>false</code> | serialize the javascript functions **(default:false)**. |
| [options.ignoreUndefined] | <code>Boolean</code> | <code>true</code> | ignore undefined fields **(default:true)**. |
| [options.index] | <code>Number</code> |  | the index in the buffer where we wish to start serializing into. |

Serialize a Javascript object using a predefined Buffer and index into the buffer, useful when pre-allocating the space for serialization.

**Returns**: <code>Number</code> - returns the index pointing to the last written byte in the buffer.
<a name="deserialize"></a>

### deserialize(buffer)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| buffer | <code>Buffer</code> |  | the buffer containing the serialized set of BSON documents. |
| [options.evalFunctions] | <code>Object</code> | <code>false</code> | evaluate functions in the BSON document scoped to the object deserialized. |
| [options.cacheFunctions] | <code>Object</code> | <code>false</code> | cache evaluated functions for reuse. |
| [options.promoteLongs] | <code>Object</code> | <code>true</code> | when deserializing a Long will fit it into a Number if it's smaller than 53 bits |
| [options.promoteBuffers] | <code>Object</code> | <code>false</code> | when deserializing a Binary will return it as a node.js Buffer instance. |
| [options.promoteValues] | <code>Object</code> | <code>false</code> | when deserializing will promote BSON values to their Node.js closest equivalent types. |
| [options.fieldsAsRaw] | <code>Object</code> | <code></code> | allow to specify if there what fields we wish to return as unserialized raw buffer. |
| [options.bsonRegExp] | <code>Object</code> | <code>false</code> | return BSON regular expressions as BSONRegExp instances. |
| [options.allowObjectSmallerThanBufferSize] | <code>boolean</code> | <code>false</code> | allows the buffer to be larger than the parsed BSON object |

Deserialize data as BSON.

**Returns**: <code>Object</code> - returns the deserialized Javascript Object.
<a name="calculateObjectSize"></a>

### calculateObjectSize(object)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| object | <code>Object</code> |  | the Javascript object to calculate the BSON byte size for. |
| [options.serializeFunctions] | <code>Boolean</code> | <code>false</code> | serialize the javascript functions **(default:false)**. |
| [options.ignoreUndefined] | <code>Boolean</code> | <code>true</code> | ignore undefined fields **(default:true)**. |

Calculate the bson size for a passed in Javascript object.

**Returns**: <code>Number</code> - returns the number of bytes the BSON object will take up.
<a name="deserializeStream"></a>

### deserializeStream(data, startIndex, numberOfDocuments, documents, docStartIndex, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Buffer</code> |  | the buffer containing the serialized set of BSON documents. |
| startIndex | <code>Number</code> |  | the start index in the data Buffer where the deserialization is to start. |
| numberOfDocuments | <code>Number</code> |  | number of documents to deserialize. |
| documents | <code>Array</code> |  | an array where to store the deserialized documents. |
| docStartIndex | <code>Number</code> |  | the index in the documents array from where to start inserting documents. |
| [options] | <code>Object</code> |  | additional options used for the deserialization. |
| [options.evalFunctions] | <code>Object</code> | <code>false</code> | evaluate functions in the BSON document scoped to the object deserialized. |
| [options.cacheFunctions] | <code>Object</code> | <code>false</code> | cache evaluated functions for reuse. |
| [options.promoteLongs] | <code>Object</code> | <code>true</code> | when deserializing a Long will fit it into a Number if it's smaller than 53 bits |
| [options.promoteBuffers] | <code>Object</code> | <code>false</code> | when deserializing a Binary will return it as a node.js Buffer instance. |
| [options.promoteValues] | <code>Object</code> | <code>false</code> | when deserializing will promote BSON values to their Node.js closest equivalent types. |
| [options.fieldsAsRaw] | <code>Object</code> | <code></code> | allow to specify if there what fields we wish to return as unserialized raw buffer. |
| [options.bsonRegExp] | <code>Object</code> | <code>false</code> | return BSON regular expressions as BSONRegExp instances. |

Deserialize stream data as BSON documents.

**Returns**: <code>Number</code> - returns the next index in the buffer after deserialization **x** numbers of documents.

## FAQ

#### Why does `undefined` get converted to `null`?

The `undefined` BSON type has been [deprecated for many years](http://bsonspec.org/spec.html), so this library has dropped support for it. Use the `ignoreUndefined` option (for example, from the [driver](http://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html#connect) ) to instead remove `undefined` keys.

#### How do I add custom serialization logic?

This library looks for `toBSON()` functions on every path, and calls the `toBSON()` function to get the value to serialize.

```javascript
const BSON = require('bson');

class CustomSerialize {
  toBSON() {
    return 42;
  }
}

const obj = { answer: new CustomSerialize() };
// "{ answer: 42 }"
console.log(BSON.deserialize(BSON.serialize(obj)));
```
# buffer [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/buffer/master.svg
[travis-url]: https://travis-ci.org/feross/buffer
[npm-image]: https://img.shields.io/npm/v/buffer.svg
[npm-url]: https://npmjs.org/package/buffer
[downloads-image]: https://img.shields.io/npm/dm/buffer.svg
[downloads-url]: https://npmjs.org/package/buffer
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### The buffer module from [node.js](https://nodejs.org/), for the browser.

[![saucelabs][saucelabs-image]][saucelabs-url]

[saucelabs-image]: https://saucelabs.com/browser-matrix/buffer.svg
[saucelabs-url]: https://saucelabs.com/u/buffer

With [browserify](http://browserify.org), simply `require('buffer')` or use the `Buffer` global and you will get this module.

The goal is to provide an API that is 100% identical to
[node's Buffer API](https://nodejs.org/api/buffer.html). Read the
[official docs](https://nodejs.org/api/buffer.html) for the full list of properties,
instance methods, and class methods that are supported.

## features

- Manipulate binary data like a boss, in all browsers!
- Super fast. Backed by Typed Arrays (`Uint8Array`/`ArrayBuffer`, not `Object`)
- Extremely small bundle size (**6.75KB minified + gzipped**, 51.9KB with comments)
- Excellent browser support (Chrome, Firefox, Edge, Safari 9+, IE 11, iOS 9+, Android, etc.)
- Preserves Node API exactly, with one minor difference (see below)
- Square-bracket `buf[4]` notation works!
- Does not modify any browser prototypes or put anything on `window`
- Comprehensive test suite (including all buffer tests from node.js core)

## install

To use this module directly (without browserify), install it:

```bash
npm install buffer
```

This module was previously called **native-buffer-browserify**, but please use **buffer**
from now on.

If you do not use a bundler, you can use the [standalone script](https://bundle.run/buffer).

## usage

The module's API is identical to node's `Buffer` API. Read the
[official docs](https://nodejs.org/api/buffer.html) for the full list of properties,
instance methods, and class methods that are supported.

As mentioned above, `require('buffer')` or use the `Buffer` global with
[browserify](http://browserify.org) and this module will automatically be included
in your bundle. Almost any npm module will work in the browser, even if it assumes that
the node `Buffer` API will be available.

To depend on this module explicitly (without browserify), require it like this:

```js
var Buffer = require('buffer/').Buffer  // note: the trailing slash is important!
```

To require this module explicitly, use `require('buffer/')` which tells the node.js module
lookup algorithm (also used by browserify) to use the **npm module** named `buffer`
instead of the **node.js core** module named `buffer`!


## how does it work?

The Buffer constructor returns instances of `Uint8Array` that have their prototype
changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of `Uint8Array`,
so the returned instances will have all the node `Buffer` methods and the
`Uint8Array` methods. Square bracket notation works as expected -- it returns a
single octet.

The `Uint8Array` prototype remains unmodified.


## tracking the latest node api

This module tracks the Buffer API in the latest (unstable) version of node.js. The Buffer
API is considered **stable** in the
[node stability index](https://nodejs.org/docs/latest/api/documentation.html#documentation_stability_index),
so it is unlikely that there will ever be breaking changes.
Nonetheless, when/if the Buffer API changes in node, this module's API will change
accordingly.

## related packages

- [`buffer-reverse`](https://www.npmjs.com/package/buffer-reverse) - Reverse a buffer
- [`buffer-xor`](https://www.npmjs.com/package/buffer-xor) - Bitwise xor a buffer
- [`is-buffer`](https://www.npmjs.com/package/is-buffer) - Determine if an object is a Buffer without including the whole `Buffer` package

## conversion packages

### convert typed array to buffer

Use [`typedarray-to-buffer`](https://www.npmjs.com/package/typedarray-to-buffer) to convert any kind of typed array to a `Buffer`. Does not perform a copy, so it's super fast.

### convert buffer to typed array

`Buffer` is a subclass of `Uint8Array` (which is a typed array). So there is no need to explicitly convert to typed array. Just use the buffer as a `Uint8Array`.

### convert blob to buffer

Use [`blob-to-buffer`](https://www.npmjs.com/package/blob-to-buffer) to convert a `Blob` to a `Buffer`.

### convert buffer to blob

To convert a `Buffer` to a `Blob`, use the `Blob` constructor:

```js
var blob = new Blob([ buffer ])
```

Optionally, specify a mimetype:

```js
var blob = new Blob([ buffer ], { type: 'text/html' })
```

### convert arraybuffer to buffer

To convert an `ArrayBuffer` to a `Buffer`, use the `Buffer.from` function. Does not perform a copy, so it's super fast.

```js
var buffer = Buffer.from(arrayBuffer)
```

### convert buffer to arraybuffer

To convert a `Buffer` to an `ArrayBuffer`, use the `.buffer` property (which is present on all `Uint8Array` objects):

```js
var arrayBuffer = buffer.buffer.slice(
  buffer.byteOffset, buffer.byteOffset + buffer.byteLength
)
```

Alternatively, use the [`to-arraybuffer`](https://www.npmjs.com/package/to-arraybuffer) module.

## performance

See perf tests in `/perf`.

`BrowserBuffer` is the browser `buffer` module (this repo). `Uint8Array` is included as a
sanity check (since `BrowserBuffer` uses `Uint8Array` under the hood, `Uint8Array` will
always be at least a bit faster). Finally, `NodeBuffer` is the node.js buffer module,
which is included to compare against.

NOTE: Performance has improved since these benchmarks were taken. PR welcome to update the README.

### Chrome 38

| Method | Operations | Accuracy | Sampled | Fastest |
|:-------|:-----------|:---------|:--------|:-------:|
| BrowserBuffer#bracket-notation | 11,457,464 ops/sec | ±0.86% | 66 | ✓ |
| Uint8Array#bracket-notation | 10,824,332 ops/sec | ±0.74% | 65 | |
| | | | |
| BrowserBuffer#concat | 450,532 ops/sec | ±0.76% | 68 | |
| Uint8Array#concat | 1,368,911 ops/sec | ±1.50% | 62 | ✓ |
| | | | |
| BrowserBuffer#copy(16000) | 903,001 ops/sec | ±0.96% | 67 | |
| Uint8Array#copy(16000) | 1,422,441 ops/sec | ±1.04% | 66 | ✓ |
| | | | |
| BrowserBuffer#copy(16) | 11,431,358 ops/sec | ±0.46% | 69 | |
| Uint8Array#copy(16) | 13,944,163 ops/sec | ±1.12% | 68 | ✓ |
| | | | |
| BrowserBuffer#new(16000) | 106,329 ops/sec | ±6.70% | 44 | |
| Uint8Array#new(16000) | 131,001 ops/sec | ±2.85% | 31 | ✓ |
| | | | |
| BrowserBuffer#new(16) | 1,554,491 ops/sec | ±1.60% | 65 | |
| Uint8Array#new(16) | 6,623,930 ops/sec | ±1.66% | 65 | ✓ |
| | | | |
| BrowserBuffer#readDoubleBE | 112,830 ops/sec | ±0.51% | 69 | ✓ |
| DataView#getFloat64 | 93,500 ops/sec | ±0.57% | 68 | |
| | | | |
| BrowserBuffer#readFloatBE | 146,678 ops/sec | ±0.95% | 68 | ✓ |
| DataView#getFloat32 | 99,311 ops/sec | ±0.41% | 67 | |
| | | | |
| BrowserBuffer#readUInt32LE | 843,214 ops/sec | ±0.70% | 69 | ✓ |
| DataView#getUint32 | 103,024 ops/sec | ±0.64% | 67 | |
| | | | |
| BrowserBuffer#slice | 1,013,941 ops/sec | ±0.75% | 67 | |
| Uint8Array#subarray | 1,903,928 ops/sec | ±0.53% | 67 | ✓ |
| | | | |
| BrowserBuffer#writeFloatBE | 61,387 ops/sec | ±0.90% | 67 | |
| DataView#setFloat32 | 141,249 ops/sec | ±0.40% | 66 | ✓ |


### Firefox 33

| Method | Operations | Accuracy | Sampled | Fastest |
|:-------|:-----------|:---------|:--------|:-------:|
| BrowserBuffer#bracket-notation | 20,800,421 ops/sec | ±1.84% | 60 | |
| Uint8Array#bracket-notation | 20,826,235 ops/sec | ±2.02% | 61 | ✓ |
| | | | |
| BrowserBuffer#concat | 153,076 ops/sec | ±2.32% | 61 | |
| Uint8Array#concat | 1,255,674 ops/sec | ±8.65% | 52 | ✓ |
| | | | |
| BrowserBuffer#copy(16000) | 1,105,312 ops/sec | ±1.16% | 63 | |
| Uint8Array#copy(16000) | 1,615,911 ops/sec | ±0.55% | 66 | ✓ |
| | | | |
| BrowserBuffer#copy(16) | 16,357,599 ops/sec | ±0.73% | 68 | |
| Uint8Array#copy(16) | 31,436,281 ops/sec | ±1.05% | 68 | ✓ |
| | | | |
| BrowserBuffer#new(16000) | 52,995 ops/sec | ±6.01% | 35 | |
| Uint8Array#new(16000) | 87,686 ops/sec | ±5.68% | 45 | ✓ |
| | | | |
| BrowserBuffer#new(16) | 252,031 ops/sec | ±1.61% | 66 | |
| Uint8Array#new(16) | 8,477,026 ops/sec | ±0.49% | 68 | ✓ |
| | | | |
| BrowserBuffer#readDoubleBE | 99,871 ops/sec | ±0.41% | 69 | |
| DataView#getFloat64 | 285,663 ops/sec | ±0.70% | 68 | ✓ |
| | | | |
| BrowserBuffer#readFloatBE | 115,540 ops/sec | ±0.42% | 69 | |
| DataView#getFloat32 | 288,722 ops/sec | ±0.82% | 68 | ✓ |
| | | | |
| BrowserBuffer#readUInt32LE | 633,926 ops/sec | ±1.08% | 67 | ✓ |
| DataView#getUint32 | 294,808 ops/sec | ±0.79% | 64 | |
| | | | |
| BrowserBuffer#slice | 349,425 ops/sec | ±0.46% | 69 | |
| Uint8Array#subarray | 5,965,819 ops/sec | ±0.60% | 65 | ✓ |
| | | | |
| BrowserBuffer#writeFloatBE | 59,980 ops/sec | ±0.41% | 67 | |
| DataView#setFloat32 | 317,634 ops/sec | ±0.63% | 68 | ✓ |

### Safari 8

| Method | Operations | Accuracy | Sampled | Fastest |
|:-------|:-----------|:---------|:--------|:-------:|
| BrowserBuffer#bracket-notation | 10,279,729 ops/sec | ±2.25% | 56 | ✓ |
| Uint8Array#bracket-notation | 10,030,767 ops/sec | ±2.23% | 59 | |
| | | | |
| BrowserBuffer#concat | 144,138 ops/sec | ±1.38% | 65 | |
| Uint8Array#concat | 4,950,764 ops/sec | ±1.70% | 63 | ✓ |
| | | | |
| BrowserBuffer#copy(16000) | 1,058,548 ops/sec | ±1.51% | 64 | |
| Uint8Array#copy(16000) | 1,409,666 ops/sec | ±1.17% | 65 | ✓ |
| | | | |
| BrowserBuffer#copy(16) | 6,282,529 ops/sec | ±1.88% | 58 | |
| Uint8Array#copy(16) | 11,907,128 ops/sec | ±2.87% | 58 | ✓ |
| | | | |
| BrowserBuffer#new(16000) | 101,663 ops/sec | ±3.89% | 57 | |
| Uint8Array#new(16000) | 22,050,818 ops/sec | ±6.51% | 46 | ✓ |
| | | | |
| BrowserBuffer#new(16) | 176,072 ops/sec | ±2.13% | 64 | |
| Uint8Array#new(16) | 24,385,731 ops/sec | ±5.01% | 51 | ✓ |
| | | | |
| BrowserBuffer#readDoubleBE | 41,341 ops/sec | ±1.06% | 67 | |
| DataView#getFloat64 | 322,280 ops/sec | ±0.84% | 68 | ✓ |
| | | | |
| BrowserBuffer#readFloatBE | 46,141 ops/sec | ±1.06% | 65 | |
| DataView#getFloat32 | 337,025 ops/sec | ±0.43% | 69 | ✓ |
| | | | |
| BrowserBuffer#readUInt32LE | 151,551 ops/sec | ±1.02% | 66 | |
| DataView#getUint32 | 308,278 ops/sec | ±0.94% | 67 | ✓ |
| | | | |
| BrowserBuffer#slice | 197,365 ops/sec | ±0.95% | 66 | |
| Uint8Array#subarray | 9,558,024 ops/sec | ±3.08% | 58 | ✓ |
| | | | |
| BrowserBuffer#writeFloatBE | 17,518 ops/sec | ±1.03% | 63 | |
| DataView#setFloat32 | 319,751 ops/sec | ±0.48% | 68 | ✓ |


### Node 0.11.14

| Method | Operations | Accuracy | Sampled | Fastest |
|:-------|:-----------|:---------|:--------|:-------:|
| BrowserBuffer#bracket-notation | 10,489,828 ops/sec | ±3.25% | 90 | |
| Uint8Array#bracket-notation | 10,534,884 ops/sec | ±0.81% | 92 | ✓ |
| NodeBuffer#bracket-notation | 10,389,910 ops/sec | ±0.97% | 87 | |
| | | | |
| BrowserBuffer#concat | 487,830 ops/sec | ±2.58% | 88 | |
| Uint8Array#concat | 1,814,327 ops/sec | ±1.28% | 88 | ✓ |
| NodeBuffer#concat | 1,636,523 ops/sec | ±1.88% | 73 | |
| | | | |
| BrowserBuffer#copy(16000) | 1,073,665 ops/sec | ±0.77% | 90 | |
| Uint8Array#copy(16000) | 1,348,517 ops/sec | ±0.84% | 89 | ✓ |
| NodeBuffer#copy(16000) | 1,289,533 ops/sec | ±0.82% | 93 | |
| | | | |
| BrowserBuffer#copy(16) | 12,782,706 ops/sec | ±0.74% | 85 | |
| Uint8Array#copy(16) | 14,180,427 ops/sec | ±0.93% | 92 | ✓ |
| NodeBuffer#copy(16) | 11,083,134 ops/sec | ±1.06% | 89 | |
| | | | |
| BrowserBuffer#new(16000) | 141,678 ops/sec | ±3.30% | 67 | |
| Uint8Array#new(16000) | 161,491 ops/sec | ±2.96% | 60 | |
| NodeBuffer#new(16000) | 292,699 ops/sec | ±3.20% | 55 | ✓ |
| | | | |
| BrowserBuffer#new(16) | 1,655,466 ops/sec | ±2.41% | 82 | |
| Uint8Array#new(16) | 14,399,926 ops/sec | ±0.91% | 94 | ✓ |
| NodeBuffer#new(16) | 3,894,696 ops/sec | ±0.88% | 92 | |
| | | | |
| BrowserBuffer#readDoubleBE | 109,582 ops/sec | ±0.75% | 93 | ✓ |
| DataView#getFloat64 | 91,235 ops/sec | ±0.81% | 90 | |
| NodeBuffer#readDoubleBE | 88,593 ops/sec | ±0.96% | 81 | |
| | | | |
| BrowserBuffer#readFloatBE | 139,854 ops/sec | ±1.03% | 85 | ✓ |
| DataView#getFloat32 | 98,744 ops/sec | ±0.80% | 89 | |
| NodeBuffer#readFloatBE | 92,769 ops/sec | ±0.94% | 93 | |
| | | | |
| BrowserBuffer#readUInt32LE | 710,861 ops/sec | ±0.82% | 92 | |
| DataView#getUint32 | 117,893 ops/sec | ±0.84% | 91 | |
| NodeBuffer#readUInt32LE | 851,412 ops/sec | ±0.72% | 93 | ✓ |
| | | | |
| BrowserBuffer#slice | 1,673,877 ops/sec | ±0.73% | 94 | |
| Uint8Array#subarray | 6,919,243 ops/sec | ±0.67% | 90 | ✓ |
| NodeBuffer#slice | 4,617,604 ops/sec | ±0.79% | 93 | |
| | | | |
| BrowserBuffer#writeFloatBE | 66,011 ops/sec | ±0.75% | 93 | |
| DataView#setFloat32 | 127,760 ops/sec | ±0.72% | 93 | ✓ |
| NodeBuffer#writeFloatBE | 103,352 ops/sec | ±0.83% | 93 | |

### iojs 1.8.1

| Method | Operations | Accuracy | Sampled | Fastest |
|:-------|:-----------|:---------|:--------|:-------:|
| BrowserBuffer#bracket-notation | 10,990,488 ops/sec | ±1.11% | 91 | |
| Uint8Array#bracket-notation | 11,268,757 ops/sec | ±0.65% | 97 | |
| NodeBuffer#bracket-notation | 11,353,260 ops/sec | ±0.83% | 94 | ✓ |
| | | | |
| BrowserBuffer#concat | 378,954 ops/sec | ±0.74% | 94 | |
| Uint8Array#concat | 1,358,288 ops/sec | ±0.97% | 87 | |
| NodeBuffer#concat | 1,934,050 ops/sec | ±1.11% | 78 | ✓ |
| | | | |
| BrowserBuffer#copy(16000) | 894,538 ops/sec | ±0.56% | 84 | |
| Uint8Array#copy(16000) | 1,442,656 ops/sec | ±0.71% | 96 | |
| NodeBuffer#copy(16000) | 1,457,898 ops/sec | ±0.53% | 92 | ✓ |
| | | | |
| BrowserBuffer#copy(16) | 12,870,457 ops/sec | ±0.67% | 95 | |
| Uint8Array#copy(16) | 16,643,989 ops/sec | ±0.61% | 93 | ✓ |
| NodeBuffer#copy(16) | 14,885,848 ops/sec | ±0.74% | 94 | |
| | | | |
| BrowserBuffer#new(16000) | 109,264 ops/sec | ±4.21% | 63 | |
| Uint8Array#new(16000) | 138,916 ops/sec | ±1.87% | 61 | |
| NodeBuffer#new(16000) | 281,449 ops/sec | ±3.58% | 51 | ✓ |
| | | | |
| BrowserBuffer#new(16) | 1,362,935 ops/sec | ±0.56% | 99 | |
| Uint8Array#new(16) | 6,193,090 ops/sec | ±0.64% | 95 | ✓ |
| NodeBuffer#new(16) | 4,745,425 ops/sec | ±1.56% | 90 | |
| | | | |
| BrowserBuffer#readDoubleBE | 118,127 ops/sec | ±0.59% | 93 | ✓ |
| DataView#getFloat64 | 107,332 ops/sec | ±0.65% | 91 | |
| NodeBuffer#readDoubleBE | 116,274 ops/sec | ±0.94% | 95 | |
| | | | |
| BrowserBuffer#readFloatBE | 150,326 ops/sec | ±0.58% | 95 | ✓ |
| DataView#getFloat32 | 110,541 ops/sec | ±0.57% | 98 | |
| NodeBuffer#readFloatBE | 121,599 ops/sec | ±0.60% | 87 | |
| | | | |
| BrowserBuffer#readUInt32LE | 814,147 ops/sec | ±0.62% | 93 | |
| DataView#getUint32 | 137,592 ops/sec | ±0.64% | 90 | |
| NodeBuffer#readUInt32LE | 931,650 ops/sec | ±0.71% | 96 | ✓ |
| | | | |
| BrowserBuffer#slice | 878,590 ops/sec | ±0.68% | 93 | |
| Uint8Array#subarray | 2,843,308 ops/sec | ±1.02% | 90 | |
| NodeBuffer#slice | 4,998,316 ops/sec | ±0.68% | 90 | ✓ |
| | | | |
| BrowserBuffer#writeFloatBE | 65,927 ops/sec | ±0.74% | 93 | |
| DataView#setFloat32 | 139,823 ops/sec | ±0.97% | 89 | ✓ |
| NodeBuffer#writeFloatBE | 135,763 ops/sec | ±0.65% | 96 | |
| | | | |

## Testing the project

First, install the project:

    npm install

Then, to run tests in Node.js, run:

    npm run test-node

To test locally in a browser, you can run:

    npm run test-browser-es5-local # For ES5 browsers that don't support ES6
    npm run test-browser-es6-local # For ES6 compliant browsers

This will print out a URL that you can then open in a browser to run the tests, using [airtap](https://www.npmjs.com/package/airtap).

To run automated browser tests using Saucelabs, ensure that your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables are set, then run:

    npm test

This is what's run in Travis, to check against various browsers. The list of browsers is kept in the `bin/airtap-es5.yml` and `bin/airtap-es6.yml` files.

## JavaScript Standard Style

This module uses [JavaScript Standard Style](https://github.com/feross/standard).

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

To test that the code conforms to the style, `npm install` and run:

    ./node_modules/.bin/standard

## credit

This was originally forked from [buffer-browserify](https://github.com/toots/buffer-browserify).

## Security Policies and Procedures

The `buffer` team and community take all security bugs in `buffer` seriously. Please see our [security policies and procedures](https://github.com/feross/security) document to learn how to report issues.

## license

MIT. Copyright (C) [Feross Aboukhadijeh](http://feross.org), and other contributors. Originally forked from an MIT-licensed module by Romain Beauxis.



