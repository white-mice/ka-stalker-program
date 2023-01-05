# ka-stalker-program
Stalks a list of KA users.

Features:
* Logs changes in bio
* Logs program creations
* Logs program updates
* Logs program deletions
* Backs up new programs and backs up edits

Data is stored locally. Can be configured to run on a mega.nz drive as well.

## Installation
`git clone https://github.com/white-mice/ka-stalker-program; cd ka-stalker-program`

### Dependencies
You need Node and NPM to run this.

To install the other dependencies, run `npm install`. The only external dependency
is [Chalk](https://github.com/chalk/chalk), because I like having color terminal output.

You will also need to create a `secrets.json` and put in your KA auth info:
```json
{
	"KAAS": "[your KAAS]"
}
```


#### Mega.nz drive
To enable mega.nz storage, you'll need to log into the drive.
Edit `.megarc`:
```ini
[Login]
Username = (mega.nz username)
Password = (password)
```

Then edit `db-interface.js` and set `IS_USING_MEGA` to `true`.

**TODO**: Make mega.nz interfacing easier.

## Running
Add the usernames of the users you want to stalk in `stalkList.json`, and then:
`npm start`

## TODO
* need to add comment logging