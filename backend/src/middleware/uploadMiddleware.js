const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subdir = 'attachments';

    const type = req.body.sourceObjectType ? String(req.body.sourceObjectType).toUpperCase() : null;
    const id = req.body.sourceObjectId;

    if (type && id) {
      switch (type) {
        case 'WORK_ORDER':
          subdir = path.join('work-orders', String(id));
          break;
        case 'WORK_ACTIVITY':
          subdir = path.join('work-activities', String(id));
          break;
        case 'ASSET':
          subdir = path.join('assets', String(id));
          break;
        case 'TICKET':
          subdir = path.join('tickets', String(id));
          break;
        default:
          subdir = path.join(type.toLowerCase(), String(id));
      }
    }

    const dest = path.join(DATA_DIR, subdir);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
};
