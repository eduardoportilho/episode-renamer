import fs from 'fs'
import path from 'path'
import promptly from 'promptly'
import program from 'commander'

const IGNORED_CHARS = [':', '’', '<', '>']
const IGNORED_CHARS_REGEXP = new RegExp(`[${IGNORED_CHARS.join('')}]`, 'gi')
const REPLACEMENT_CHAR = '_'

program
  .option('-f, --filter [query]', 'Include only files that match <query>')
  .option('-v, --verbose', 'Logs everything')
  .parse(process.argv);
const filter = program.filter || undefined
const VERBOSE = program.verbose

doTheMagic(filter)

async function doTheMagic(filter) {
  const episodes = readEpisodeList('episodes.txt')
  const files = getFileList()
  const filesToRename = getFilesToRename(files, episodes, filter)

  console.log(`\nFiles to rename (${filesToRename.rename.length}):`)
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

function getFilesToRename(files, episodes, filter) {
  const fileList = {
    rename: [],
    ignore: []
  }
  for (const fileName of files) {
    if (!shouldRenameFile(fileName, filter)) {
      VERBOSE && console.log(`File ignored by filtering: [${fileName}]`)
      fileList.ignore.push(fileName)
      continue
    }
    const episode = getMatchingEpisode(fileName, episodes)
    if (!episode) {
      VERBOSE && console.log(`No matching episode: [${fileName}]`)
      fileList.ignore.push(fileName)
      continue
    } else {
      const newFileName = getNewFileName(fileName, episode)
      fileList.rename.push({
        from: fileName,
        to: newFileName}
      )
    }
  }
  return fileList
}

function getMatchingEpisode(fileName, episodes) {
  for (let i = 0; i < episodes.length; i++) {
    const episodeName = sanitise(episodes[i])
    const sanitisedFileName = sanitise(fileName)

    // DEBUG
    // console.log(`"${sanitisedFileName}".indexOf("${episodeName})`, sanitisedFileName.indexOf(episodeName))

    if (sanitisedFileName.indexOf(episodeName) >= 0) {
      return {
        number: i+1,
        name: episodeName
      }
    }
  }
  return undefined
}

function sanitise(fileName) {
  return fileName.replace(IGNORED_CHARS_REGEXP, REPLACEMENT_CHAR).trim()
}

function shouldRenameFile(fileName, filter) {
  const fileNameStartWithNumber = fileName.match(/^\d+/)
  let isFileIncluded = true
  if (filter) {
    const regexp = new RegExp(filter, 'gi')
    isFileIncluded = fileName.match(regexp)
  }
  return !fileNameStartWithNumber && isFileIncluded
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
    console.log("📦  Done!")
}

