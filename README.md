# episode-renamer

## Build
* yarn
* yarn build 

## Install
* npm install -g episode-renamer

## Use
* In a folder with your episode files, create a file named 'episodes.txt' containg the name of the episode files in the desired order
* For egghead.io you can generate one with this script:
```js
let a=[];document.querySelectorAll('a.lh-title').forEach(l => a.push(l.text));copy(a.join('\n'));
```
* Run `episode-renamer` and follow the instructions
