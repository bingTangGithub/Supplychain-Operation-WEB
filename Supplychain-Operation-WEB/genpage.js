const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const colors = require('colors');
const readline = require('readline');

const usage = () => {
  console.log('===========================Usage=============================');
  console.log('=                                                           =');
  console.log('=         node gen pagename [template suffix:html|tpl]      =');
  console.log('=                                                           =');
  console.log('=============================================================');
};

let paths = {
  page: './src/routes/Manage/',
  templates: './templates/',
};

const setConfig = (cb) => {
  let moduleName = '';
  let parameters = false;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let question = {};
  const setPromptTitle = (() => {
    let questionIndex = -1;
    const questions = [
      {
        type: 'moduleName',
        question: '请输入模块名称 > ',
      }, {
        type: 'parameters',
        question: '是否需要参数id? 1:需要, 2:不需要 > ',
      },
    ];
    return () => {
      questionIndex += 1;
      if (questions[questionIndex]) {
        console.log(questions[questionIndex].question.green);
      } else {
        rl.close();
      }
      question = questions[questionIndex];
    };
  })();
  setPromptTitle();

  const rlEnd = () => {
    rl.close();
    cb({
      moduleName,
      parameters,
    });
  };

  rl.on('line', (line) => {
    const value = line.trim();
    switch (question.type) {
      case 'moduleName':
        if (/^[A-Z]\w+$/.test(value)) {
          moduleName = value;
          setPromptTitle();
        } else {
          console.log('输入不合法，请重新输入'.red);
        }
        break;
      case 'parameters':
        if (/1|(true)/.test(line.trim())) {
          setPromptTitle();
          parameters = true;
        } else {
          parameters = false;
        }
        rlEnd();
        break;
      default:
        rlEnd();
        break;
    }
  });
};

const parseTplByStretagy = () => {
  const commands = {
    moduleName(opt) {
      return opt.moduleName.toLowerCase();
    },
    ModuleName(opt) {
      return opt.moduleName;
    },
    id(opt) {
      return opt.needId ? `, '/:id'` : ``;
    },
  };
  const parseTpl = (content, option, subFile = '') => {
    const pageContent = new String(content).replace(
      /@@(.*?)@@/gm,
      (group, matched) => commands[matched](option)
    );
    return {
      name: 'index',
      filepath: `${paths.page}${option.moduleName}/${subFile}`,
      content: pageContent,
      subfix: 'jsx',
    };
  };
  const parseTplStretagy = {
    tpl(content, option) {
      return parseTpl(content, option, '');
    },
    modules(content, option) {
      return parseTpl(content, option, 'modules/');
    },
    containers(content, option) {
      return parseTpl(content, option, 'containers/');
    },
    components(content, option) {
      return parseTpl(content, option, 'components/');
    },
  };

  return (tplKey, content, option) => parseTplStretagy[tplKey](content, option);
};

const parseTpls = (tplContents, parseOption) => {
  const parsedContentInfomation = {};
  const parseSingleTpl = parseTplByStretagy();

  Object.keys(tplContents).forEach((tplKey) => {
    parsedContentInfomation[tplKey] = parseSingleTpl(tplKey, tplContents[tplKey], parseOption);
  });
  return parsedContentInfomation;
};


const writeGenFiles = (targetFilesInfo) => {
  Object.keys(targetFilesInfo).forEach((key) => {
    const info = targetFilesInfo[key];
    const dirname = path.join(__dirname, info.filepath);
    const filepath = `${dirname}${info.name}.${info.subfix}`;

    const writeFileFn = () => {
      fs.writeFile(filepath, info.content, (err) => {
        if (err) throw err;
        console.log(`${filepath}创建成功`);

        // console.log(`file ${info.name} exists ${fs.existsSync(filepath)}`);
      });
    };

    fs.exists(dirname, (exists) => {
      if (exists) {
        //writeFileFn();
        console.log('该模块已存在'.red);
      } else {
        fs.mkdirSync(dirname, 0o777);
        writeFileFn();
      }
    });
  });
};

const readTplFiles = () => {
  const contentMap = {};
  const tplNames = {
    tpl: 'index.tpl',
    modules: 'modules/jsx.tpl',
    containers: 'containers/jsx.tpl',
    components: 'components/jsx.tpl',
  };

  Object.keys(tplNames).forEach((tplNameKey) => {
    const tplName = [paths.templates, tplNames[tplNameKey]].join('');
    contentMap[tplNameKey] = fs.readFileSync(path.join(__dirname, tplName));
  });

  return contentMap;
};


const execCmd = ({ moduleName, parameters: needId }) => {
  console.log('=============================================================');
  console.log(`模块访问路径为/Manage/${moduleName}${needId ? '/:id' : ''}`);
  console.log('=============================================================');

  const tplJson = readTplFiles();
  const targetFilesInfo = parseTpls(tplJson, {
    moduleName,
    needId,
  });

  writeGenFiles(targetFilesInfo);
};

usage();
setConfig((config) => execCmd(config));