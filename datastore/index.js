const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const util = require('util');
const asyncReadFile = util.promisify(fs.readFile);
const asyncWriteFile = util.promisify(fs.writeFile);
const asyncUnlink = util.promisify(fs.unlink);

var items = {};

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    const filePath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        throw ('error writing counter');
      } else {
        items[id] = text;
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  let data = [];
  fs.readdir(exports.dataDir, (err, filesNames) => {
    let files = filesNames.map((fileName) => {
      const filePath = path.join(exports.dataDir, fileName);
      return asyncReadFile(filePath).then(text => {
        return {
          id: path.basename(fileName, '.txt'),
          text: text.toString()
        }
      });
    });
    Promise.all(files).then(items => {
      callback(null, items);
    }).catch(err => callback(err));
  })
};

exports.readOne = (id, callback) => {
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    const filePath = path.join(exports.dataDir, `${id + '.txt'}`);
    asyncWriteFile(filePath, text).then(() => {
      console.log(t);
      items[id] = text;
      callback(null, { id, text });
    }).catch(err => callback(err, null));
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    const filePath = path.join(exports.dataDir, `${id}.txt`);
    asyncUnlink(filePath).then(() => {
      delete items[id];
      callback();
    }).catch(err => callback(new Error(`No item with id: ${id}`)));

  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
