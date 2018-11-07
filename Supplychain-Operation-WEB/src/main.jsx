import { FunDebugUtil, CountlyUtil } from '@xinguang/common-tool';
import React from 'react';
import ReactDOM from 'react-dom';
import RedBox from 'redbox-react';
import { getNodeEnv, getBaseUrl } from './util';
import config from './config.json';
import './util/fix';
import createStore from './store/createStore';
import AppContainer from './containers/AppContainer';
import { createRoutes } from './routes/index';

// ========================================================
// 初始化的appKey在src/config.json中的countly处可找到
// ========================================================
const NODE_ENV = getNodeEnv();
const countlyAppKey = config.countly.appKey[NODE_ENV];
CountlyUtil.init(countlyAppKey, NODE_ENV);

// ========================================================
// 初始化的fundebug
// ========================================================

FunDebugUtil.init(process.env.funDebugKey, NODE_ENV, process.env.version, '', {});

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.__INITIAL_STATE__;
const store = createStore(initialState);

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let render = () => {
  const routes = createRoutes(store);
  ReactDOM.render(
    <AppContainer store={store} routes={routes} />,
    MOUNT_NODE
  );
};

// This code is excluded from production bundle
if (__DEVELOPMENT__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render;
    const renderError = (error) => {
      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
    };

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp();
      } catch (error) {
        renderError(error);
      }
    };

    // Setup hot module replacement
    module.hot.accept('./routes/index', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE);
        render();
      })
    );
  }
}

const token = localStorage.getItem('accessToken');
const entryUrl = getBaseUrl('entryUrl');
// const selfUrl = getBaseUrl('selfUrl');

const injectEvent = (eData) => {
  const postCode = { // 传输码
    request: 'toobob-1001',
    response: 'toobob-1002',
    received: 'toobob-1003',
  };
  let receiveFlag = false;
  let timer;
  const { post, failFn, allowUrls } = eData;
  const receiveMessage = (event, { allowUrls: urls, successFn }) => {
    let flag = false;
    urls.forEach((url) => {
      new RegExp(url).test(event.origin) && (flag = true);
    });
    if (flag) {
      const { code, data } = event.data;
      switch (code) {
        case postCode.request:
          console.log('post');
          event.source.postMessage({
            code: postCode.response,
            data: {
              accessToken: localStorage.getItem('accessToken'),
              refreshToken: localStorage.getItem('refreshToken'),
            },
          }, '*');
          break;

        case postCode.response:
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', data.user);
          localStorage.setItem('phone', data.phone);

          event.source.postMessage({ code: postCode.received }, '*');

          receiveFlag = true;
          clearTimeout(timer);

          successFn && successFn();
          break;

        case postCode.received:
          console.log('got received');
          break;

        default:
          break;
      }
    }
    return event;
  };
  window.addEventListener('message', (event) => receiveMessage(event, eData));

  // 发送请求 获取数据
  if (post) {
    window.opener.postMessage({ code: postCode.request }, allowUrls[0]);
    timer = setTimeout(() => {
      receiveFlag || (failFn && failFn());
    }, 3000);
  }
};

const resetToken = (doGo, url) => {
  localStorage.setItem('accessToken', '');
  localStorage.setItem('refreshToken', '');
  return injectEvent({
    allowUrls: [url],
    post: true,
    successFn: () => doGo(),
    failFn: () => window.location.assign(url),
  });
};
if (token && !window.opener) { // 有token，没有opener
  render();
} else if (!token && !window.opener) { // 没有token，没有opener
  window.location.assign(entryUrl);
} else { // 有opener
  resetToken(render, entryUrl);
}

// ========================================================
// Go!
// ========================================================
// render();
