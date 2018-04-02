#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

doTheMagic()

function doTheMagic() {
  const episodes = readEpisodeList('episodes.txt')
  const files = getFileList()
  const filesToRename = getFilesToRename(files, episodes)

  console.log('Files to rename:')
  filesToRename.forEach(rename => console.log(`- [${rename.from}]  ->  [${rename.to}]`))

  // const shouldProceed = await promptly.confirm('Proceed with the renaming?')
  // console.log(`>>>`, shouldProceed)
} 

function readEpisodeList(episodeFileName) {
  let filePath = path.join('./', episodeFileName)
  return fs.readFileSync(filePath, 'utf8').toString().split('\n')
}

function getFileList() {
  return fs.readdirSync('./')
}

function getFilesToRename(files, episodes) {
  const filesToRename = []
  for (const fileName of files) {
    const episode = getMatchingEpisode(fileName, episodes)
    if (episode && shouldRenameFile(fileName)) {
      const newFileName = getNewFileName(fileName, episode)
      filesToRename.push({
        from: fileName,
        to: newFileName}
      )
    }
  }
  return filesToRename
}

function getMatchingEpisode(fileName, episodes) {
  for (let i = 0; i < episodes.length; i++) {
    const episodeName = episodes[i]
    if (fileName.indexOf(episodeName) >= 0) {
      return {
        number: i+1,
        name: episodeName
      }
    }
  }
  return undefined
}

function shouldRenameFile(fileName) {
  return !fileName.match(/^\d+/)
}

function getNewFileName(fileName, episode) {
  const extension = getFileExtension(fileName)
  return `${episode.number} - ${episode.name}${extension}`
}

function getFileExtension(fileName) {
  const extIndex = fileName.lastIndexOf('.')
  if (extIndex > 0) {
    return fileName.substr(extIndex)
  }
  return ''
}

