const fs = require('fs');
const path = require('path')
const { promisify } = require('util');
const asyncReadDir = promisify(fs.readdir)
const asyncReadFile = promisify(fs.readFile)

const createTemplate = (array) => {
  let counter = 0;
  const template = []
  let subMenuItem = []
  array = array.filter((tag) => {
    if (/^ul/.test(tag)) {
      counter += 1;
      if (counter > 1) {
        subMenuItem.push(tag)
        return false
      } else {
        subMenuItem = []
        tag = `${tag} {subMenuItem}`
        return tag;
      }
    } else if (/^\/ul/.test(tag)) {
      counter -= 1
      if (counter > 0) {
        subMenuItem.push(tag)
        return false
      } else {
        template.push(subMenuItem)
        return tag
      }
    }
    if (counter > 0) {
      subMenuItem.push(tag);
      return false
    } else {
      return tag
    }
  })
  if (array.length) {
    return [array, template]
  } 
}

const formatSubMenus = (tags) => {
  // tags = tags.map((tag) => {
    // tag.split('>| ')
    // return tag
  // })
  // console.log(tags);
}

const iterateOverArrays = (template) => {
  console.log(template)
  const newSubMenu = createTemplate(template)
  while (newSubMenu[1].length > 0) {  
    template.push(newSubMenu[0])
    const subSubMenu = createTemplate(newSubMenu[1])
    newSubMenu[1] = subSubMenu[1]
  }
  return template
}

const init = async() => {
  try {
    const templatePath = path.join(__dirname, 'includes')
    const files = await asyncReadDir(templatePath)
    files.forEach(async(file) => {
      const filePath = path.join(templatePath, file)
      const content = await asyncReadFile(filePath, "utf-8");
      let htmlTags = content.split('<');
      let returnedArray = createTemplate(htmlTags)
      let mainTemplate = returnedArray[0]
      let subMenus = returnedArray[1]
      const newTemplate = {}
      subMenus = subMenus.map((subMenu, i) => {
        if (i === 1) {
          subMenu = iterateOverArrays(subMenu)
        }
        return subMenu
      })
      let subMenuCounter = 0
      mainTemplate = mainTemplate.map((tag) => {
        if (/^ul/.test(tag)) {
          subMenuCounter += 1
          return tag + `{ subMenu${subMenuCounter} }`
        } else {
          return tag
        }
      })
      fs.writeFile('template.html', `${mainTemplate.join('<')}`, (err) => {
        console.log(err)
      })
    })
  } catch(err){
    throw new Error(err)
  }
}

init()