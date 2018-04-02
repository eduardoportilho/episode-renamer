import fs from 'fs'
import path from 'path'
import promptly from 'promptly'
const IGNORED_CHARS = [':', '’']
const REPLACEMENT_CHAR = '_'

doTheMagic()

async function doTheMagic() {
  const episodes = readEpisodeList('episodes.txt')
  const files = getFileList()
  const filesToRename = getFilesToRename(files, episodes)

  console.log(`Files to rename (${filesToRename.rename.length}):`)
  filesToRename.rename.forEach(rename => console.log(`- [${rename.from}]  ->  [${rename.to}]`))
  console.log(`\nIgnored files (${filesToRename.ignore.length}):`)
  filesToRename.ignore.forEach(file => console.log(`- [${file}]`))
  console.log(`\n`)

  let shouldProceed
  try {
    shouldProceed = await promptly.confirm('Proceed with the renaming (y/n)?')
  } catch (e) {}
  
  if (shouldProceed) {
    executeRenaming(filesToRename.rename)
  } else {
    console.log("⛔️  Aborted!")
  }
} 

function readEpisodeList(episodeFileName) {
  let filePath = path.join('./', episodeFileName)
  return fs.readFileSync(filePath, 'utf8').toString().split('\n')
}

function getFileList() {
  return fs.readdirSync('./')
}

function getFilesToRename(files, episodes) {
  const fileList = {
    rename: [],
    ignore: []
  }
  for (const fileName of files) {
    const episode = getMatchingEpisode(fileName, episodes)
    if (episode && shouldRenameFile(fileName)) {
      const newFileName = getNewFileName(fileName, episode)
      fileList.rename.push({
        from: fileName,
        to: newFileName}
      )
    } else {
      fileList.ignore.push(fileName)
    }
  }
  return fileList
}

function getMatchingEpisode(fileName, episodes) {
  for (let i = 0; i < episodes.length; i++) {
    const episodeName = sanitise(episodes[i])
    if (fileName.indexOf(episodeName) >= 0) {
      return {
        number: i+1,
        name: episodeName
      }
    }
  }
  return undefined
}

function sanitise(fileName) {
  const regexp = new RegExp(`[${IGNORED_CHARS.join()}]`, 'gi')
  return fileName.replace(regexp, REPLACEMENT_CHAR)
}

function shouldRenameFile(fileName) {
  return !fileName.match(/^\d+/)
}

function getNewFileName(fileName, episode) {
  const extension = getFileExtension(fileName)
  return sanitise(`${episode.number} - ${episode.name}${extension}`)
}

function getFileExtension(fileName) {
  const extIndex = fileName.lastIndexOf('.')
  if (extIndex > 0) {
    return fileName.substr(extIndex)
  }
  return ''
}

function executeRenaming(renameList) {
    console.log("🚚  Renaming...")
    for (const rename of renameList) {
      process.stdout.write(`... - [${rename.from}]`)
      try {
        fs.renameSync(rename.from, rename.to)
        process.stdout.write(`\r✅  - [${rename.to}]\n`)
      } catch (e) {
        process.stdout.write(`\r❌  - [${rename.from}]\n`)
      }
    }
    console.log("Done!")
}

