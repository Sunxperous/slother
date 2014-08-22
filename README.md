# Slother 

A webapp for groups of users to overlap and view their calendars at the same time, so as to facilitate the finding of free slots for activity and events management.

Primarily aimed at users of [NUSMods](NUSMods.com). Made for NUS School of Computing Orbital Programme CP3108B 2014.

## Implementation

The current app
* runs on [node.js](//nodejs.org),
  * under the [Express](//expressjs.com) framework,
  * with [Jade](//jade-lang.com) as HTML templating engine,
  * [Passport](//passportjs.org) authentication middleware, and
  * [Moment.js](//momentjs.com),
* relies on [NUSMods API](https://github.com/nusmodifications/nusmods-api),
* uses [MongoDB](//mongodb.org),
  * with the [Mongoose](//mongoosejs.com) wrapper,
* has only vanilla CSS and (client-side) JavaScript, and
* is hosted on [Heroku](//heroku.com).

## Setup

We make use of [Vagrant](//vagrantup.com) (requires [VirtualBox](https://www.virtualbox.org)) and [Puppet](//puppetlabs.com) for development on our machines.

After cloning the repository, run the following commands:

    git submodule init
    git submodule update
    vagrant up
    
Once the virtual machine is set up, `vagrant ssh` into the machine, and `cd /vagrant`.

To run the server:

    supervisor -i src/public src/app.js
    browser-sync start --config bs-config.js
    
The first command is [node-supervisor](https://github.com/isaacs/node-supervisor), which ignores the `src/public` folder and runs `src/app.js`.

The second command allows live reloading of client side resources across several devices.

Access the app at `http://localhost:8012/`.

## To-do

* Implement social network login for easier friend finding.
* Sync with existing calendar apps.
* Location information and maps display.
* Proper notifications system with WebSockets.
* Tests.
* ...
