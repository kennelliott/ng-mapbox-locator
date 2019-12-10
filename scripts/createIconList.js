const fs = require('fs')
const glob = require('glob')
const imageSize = require('image-size')
const path = require('path')

const iconList = glob.sync("src/ngm-assets/img/icons/*.png")

const targetArr = []

const iconNames = {
    "poi_b" : "Point of interest",
    "townspot_a" : "City",
    "capital_city_a": "Capital"
}

iconList.forEach((d, i) => {

    const imgSize = imageSize(d)

    const targetColorObj = {}
    const sepSplit = path.basename(d).split("_")
    const colorId = sepSplit[sepSplit.length - 1].replace(".png", "")

    const id = path.basename(d).toLowerCase().replace("_black", "").replace("_white", "").replace(".png", "")

    targetColorObj[colorId] = path.basename(d)

    const foundObjIdx = targetArr.findIndex(t => t.id == id)
    if (foundObjIdx > -1) {
        Object.assign(targetArr[foundObjIdx].colors, targetColorObj)
    } else {
        targetArr.push({
            id: id,
            colors: targetColorObj,
            size: [imgSize.width, imgSize.height],
            name: iconNames[id] || undefined
        })
    }


})

fs.writeFileSync("./src/data/icons.json", JSON.stringify(targetArr))
